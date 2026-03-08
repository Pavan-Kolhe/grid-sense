"use client";

import { useEffect, useRef, useState } from "react";
import type { Lane, SignalUpdate } from "@/types/traffic";
import TrafficLight from "@/components/TrafficLight";
import EventLog from "@/components/EventLog";
import StatsCard from "@/components/StatsCard";
import IntersectionMap from "@/components/IntersectionMap";
import EmergencyPanel from "@/components/EmergencyPanel";

const LANES: Lane[] = ["North", "South", "East", "West"];
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

const defaultUpdate: SignalUpdate = {
  type: "SIGNAL_UPDATE",
  intersection: "INT-001",
  lights: { North: "GREEN", South: "RED", East: "RED", West: "RED" },
  densities: { North: 0, South: 0, East: 0, West: 0 },
  counts: { North: 0, South: 0, East: 0, West: 0 },
  active_emergency: false,
  ts: Math.floor(Date.now() / 1000),
  cycle_count: 0,
  avg_wait_seconds: 0,
  last_event: "Initializing...",
};

interface EventEntry {
  time: string;
  message: string;
  type: "SIGNAL_UPDATE" | "EMERGENCY_OVERRIDE" | "DENSITY_UPDATE";
}

type StreamStatus = "connecting" | "live" | "offline";

export default function Page() {
  const [state, setState] = useState<SignalUpdate>(defaultUpdate);
  const [eventLog, setEventLog] = useState<EventEntry[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>("connecting");
  const [uptime, setUptime] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const reconnectRef = useRef(1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Uptime counter
  useEffect(() => {
    timerRef.current = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // SSE connection
  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      setStreamStatus("connecting");
      es = new EventSource(`${BACKEND_URL}/stream`);

      es.onopen = () => {
        setStreamStatus("live");
        reconnectRef.current = 1000;
      };

      es.onmessage = (event) => {
        const parsed = JSON.parse(event.data) as SignalUpdate;
        setState(parsed);
        setStreamStatus("live");
        setTotalEvents((n) => n + 1);

        const timeStr = new Date(parsed.ts * 1000).toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setEventLog((prev) => {
          const entry: EventEntry = {
            time: timeStr,
            message: parsed.last_event,
            type: parsed.type,
          };
          return [entry, ...prev].slice(0, 30);
        });
      };

      es.onerror = () => {
        setStreamStatus("offline");
        es?.close();
        reconnectTimer = setTimeout(() => {
          reconnectRef.current = Math.min(reconnectRef.current * 2, 15000);
          connect();
        }, reconnectRef.current);
      };
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, []);

  const triggerEmergency = async (lane: Lane) => {
    await fetch(`${BACKEND_URL}/emergency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lane, duration_seconds: 30 }),
    });
  };

  const totalVehicles = LANES.reduce((sum, lane) => sum + (state.counts[lane] ?? 0), 0);
  const avgDensity = LANES.reduce((sum, lane) => sum + state.densities[lane], 0) / 4;
  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const statusConfig = {
    live: { label: "LIVE", cls: "live" },
    connecting: { label: "CONNECTING", cls: "connecting" },
    offline: { label: "OFFLINE", cls: "offline" },
  }[streamStatus];

  return (
    <main
      className="relative z-10 min-h-screen"
      style={{ background: "transparent" }}
    >
      {/* Emergency full-screen overlay hint */}
      {state.active_emergency && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 50,
            border: "3px solid rgba(239, 68, 68, 0.5)",
            animation: "emergencyBg 0.8s ease-in-out infinite",
          }}
        />
      )}

      <div className="max-w-[1440px] mx-auto px-4 py-4 md:px-6 md:py-5 space-y-4">

        {/* ─── HEADER ─── */}
        <header
          className="rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 corner-decor"
          style={{
            background: "rgba(8, 15, 35, 0.9)",
            border: state.active_emergency
              ? "1px solid rgba(239, 68, 68, 0.4)"
              : "1px solid rgba(56, 189, 248, 0.15)",
            backdropFilter: "blur(20px)",
            boxShadow: state.active_emergency
              ? "0 0 40px rgba(239, 68, 68, 0.1)"
              : "0 0 40px rgba(56, 189, 248, 0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{
                background: "rgba(56,189,248,0.1)",
                border: "1px solid rgba(56,189,248,0.25)",
                boxShadow: "0 0 20px rgba(56,189,248,0.15)",
              }}
            >
              🚦
            </div>
            <div>
              <h1 className="font-orbitron text-lg font-bold leading-none animate-glitch" style={{ color: "#e2f0ff" }}>
                GRIDSENSE
              </h1>
              <p className="font-mono-tech text-xs mt-0.5" style={{ color: "#475569" }}>
                AI TRAFFIC COMMAND CENTER
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SSE Status */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className={`status-dot ${statusConfig.cls}`} />
              <span className="font-mono-tech text-xs" style={{ color: "#94a3b8" }}>
                SSE: {statusConfig.label}
              </span>
            </div>

            {/* Intersection ID */}
            <div
              className="rounded-lg px-3 py-1.5"
              style={{ background: "rgba(56,189,248,0.08)", border: "1px solid rgba(56,189,248,0.15)" }}
            >
              <span className="font-orbitron text-xs font-semibold" style={{ color: "#38bdf8" }}>
                {state.intersection}
              </span>
            </div>

            {/* Uptime */}
            <div
              className="rounded-lg px-3 py-1.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-mono-tech text-xs" style={{ color: "#475569" }}>
                UP {formatUptime(uptime)}
              </span>
            </div>

            {/* Emergency badge */}
            {state.active_emergency && (
              <div
                className="rounded-lg px-3 py-1.5"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  animation: "emergencyBg 0.8s infinite",
                }}
              >
                <span className="font-orbitron text-xs font-bold" style={{ color: "#fca5a5" }}>
                  ⚡ EMERGENCY
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatsCard
            label="Total Vehicles"
            value={totalVehicles}
            icon="🚗"
            accent="#38bdf8"
            subtext="detected this cycle"
          />
          <StatsCard
            label="Avg Wait"
            value={state.avg_wait_seconds.toFixed(1)}
            unit="sec"
            icon="⏱"
            accent="#fbbf24"
            subtext="across all lanes"
          />
          <StatsCard
            label="Cycles Run"
            value={state.cycle_count}
            icon="🔄"
            accent="#4ade80"
            subtext={`avg density ${avgDensity.toFixed(1)}%`}
          />
          <StatsCard
            label="Events"
            value={totalEvents}
            icon="📡"
            accent={state.active_emergency ? "#ef4444" : "#a78bfa"}
            subtext={state.active_emergency ? "EMERGENCY ACTIVE" : "nominal"}
          />
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: 4 traffic lights */}
          <div className="lg:col-span-2 space-y-4">
            <div
              className="rounded-2xl p-5 corner-decor"
              style={{
                background: "rgba(8, 15, 35, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: "#38bdf8" }}>
                  SIGNAL GRID
                </h2>
                <span className="font-mono-tech text-xs" style={{ color: "#334155" }}>
                  CYCLE #{state.cycle_count}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {LANES.map((lane) => (
                  <TrafficLight
                    key={lane}
                    lane={lane}
                    color={state.lights[lane]}
                    density={state.densities[lane]}
                    count={state.counts[lane] ?? Math.round((state.densities[lane] / 100) * 50)}
                    isEmergency={state.active_emergency && state.lights[lane] === "GREEN"}
                  />
                ))}
              </div>
            </div>

            {/* Last event bar */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3"
              style={{
                background: "rgba(8, 15, 35, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.08)",
              }}
            >
              <span className="font-mono-tech text-xs shrink-0" style={{ color: "#334155" }}>LAST EVENT</span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(56,189,248,0.08)" }}
              />
              <span
                className="font-mono-tech text-xs"
                style={{ color: state.active_emergency ? "#fca5a5" : "#38bdf8" }}
              >
                {state.last_event}
              </span>
            </div>
          </div>

          {/* Right: Map + Emergency */}
          <div className="space-y-4">
            <IntersectionMap
              lights={state.lights}
              densities={state.densities}
              activeEmergency={state.active_emergency}
            />
            <EmergencyPanel
              activeEmergency={state.active_emergency}
              onTrigger={triggerEmergency}
            />
          </div>
        </div>

        {/* ─── BOTTOM ROW: Density overview + Event Log ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Density overview */}
          <div
            className="rounded-2xl p-5 corner-decor"
            style={{
              background: "rgba(8, 15, 35, 0.85)",
              border: "1px solid rgba(56, 189, 248, 0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: "#38bdf8" }}>
                LANE DENSITY MONITOR
              </h2>
              <span className="font-mono-tech text-xs" style={{ color: "#334155" }}>
                LIVE
              </span>
            </div>
            <div className="space-y-4">
              {LANES.map((lane) => {
                const d = state.densities[lane];
                const barColor = d < 30 ? "#4ade80" : d < 60 ? "#fbbf24" : d < 80 ? "#f97316" : "#f43f5e";
                const count = state.counts[lane] ?? Math.round((d / 100) * 50);
                return (
                  <div key={lane}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: `${barColor}15`, border: `1px solid ${barColor}30` }}
                        >
                          <span className="font-orbitron text-xs font-bold" style={{ color: barColor }}>
                            {lane[0]}
                          </span>
                        </div>
                        <span className="font-mono-tech text-sm" style={{ color: "#94a3b8" }}>
                          {lane}
                        </span>
                        <span
                          className="font-orbitron text-xs px-2 py-0.5 rounded"
                          style={{
                            background: `${
                              state.lights[lane] === "GREEN"
                                ? "#4ade80"
                                : state.lights[lane] === "YELLOW"
                                ? "#fbbf24"
                                : "#f43f5e"
                            }20`,
                            color:
                              state.lights[lane] === "GREEN"
                                ? "#4ade80"
                                : state.lights[lane] === "YELLOW"
                                ? "#fbbf24"
                                : "#f43f5e",
                          }}
                        >
                          {state.lights[lane]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-tech text-xs" style={{ color: "#475569" }}>
                          {count} vehicles
                        </span>
                        <span className="font-orbitron text-sm font-bold" style={{ color: barColor }}>
                          {d.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="density-track">
                      <div
                        className="density-fill"
                        style={{
                          width: `${d}%`,
                          background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Priority score hint */}
            <div
              className="mt-5 rounded-xl p-3"
              style={{ background: "rgba(56,189,248,0.04)", border: "1px solid rgba(56,189,248,0.08)" }}
            >
              <p className="font-orbitron text-xs mb-1" style={{ color: "#334155" }}>
                ALGORITHM
              </p>
              <p className="font-mono-tech text-xs leading-relaxed" style={{ color: "#1e3a5f" }}>
                score = (density × 0.6) + (wait_time × 0.4) · starvation guard @90s
              </p>
            </div>
          </div>

          {/* Event Log */}
          <div style={{ minHeight: 300 }}>
            <EventLog events={eventLog} />
          </div>
        </div>

        {/* ─── FOOTER ─── */}
        <footer className="text-center pb-4">
          <p className="font-mono-tech text-xs" style={{ color: "#1e293b" }}>
            GridSense v2.0 · YOLOv8n + FastAPI + Redis Pub/Sub + Next.js 14 · Hackathon Edition
          </p>
        </footer>
      </div>
    </main>
  );
}
