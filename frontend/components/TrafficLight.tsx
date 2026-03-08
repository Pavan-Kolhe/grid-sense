"use client";

import type { LightColor } from "@/types/traffic";

interface TrafficLightProps {
  lane: string;
  color: LightColor;
  density: number;
  count: number;
  isEmergency: boolean;
}

const LANE_ARROWS: Record<string, string> = {
  North: "↑",
  South: "↓",
  East: "→",
  West: "←",
};

const LANE_POSITIONS: Record<string, { label: string; bg: string }> = {
  North: { label: "N", bg: "rgba(56, 189, 248, 0.08)" },
  South: { label: "S", bg: "rgba(99, 102, 241, 0.08)" },
  East: { label: "E", bg: "rgba(16, 185, 129, 0.08)" },
  West: { label: "W", bg: "rgba(245, 158, 11, 0.08)" },
};

function getBulbClass(bulbColor: "red" | "yellow" | "green", currentColor: LightColor): string {
  const colorMap = { red: "RED", yellow: "YELLOW", green: "GREEN" } as const;
  const isActive = currentColor === colorMap[bulbColor];

  if (isActive) {
    if (bulbColor === "green") return "light-green light-bulb active-green";
    if (bulbColor === "yellow") return "light-yellow light-bulb active-yellow";
    return "light-red light-bulb active-red";
  }
  return `light-bulb inactive-${bulbColor}`;
}

function getDensityColor(density: number): string {
  if (density < 30) return "from-emerald-500 to-emerald-400";
  if (density < 60) return "from-amber-500 to-amber-400";
  if (density < 80) return "from-orange-500 to-orange-400";
  return "from-rose-500 to-rose-400";
}

export default function TrafficLight({ lane, color, density, count, isEmergency }: TrafficLightProps) {
  const pos = LANE_POSITIONS[lane];

  return (
    <div
      className={`corner-decor rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-500 ${
        isEmergency ? "emergency-active" : ""
      }`}
      style={{
        background: isEmergency ? "rgba(239, 68, 68, 0.08)" : pos.bg,
        border: `1px solid ${isEmergency ? "rgba(239, 68, 68, 0.35)" : "rgba(56, 189, 248, 0.12)"}`,
      }}
    >
      {/* Lane header */}
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="flex items-center gap-2">
          <span
            className="font-orbitron text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: "rgba(56, 189, 248, 0.12)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            {pos.label}
          </span>
          <span className="font-orbitron text-sm font-semibold tracking-wider text-slate-300">
            {lane.toUpperCase()}
          </span>
        </div>
        <span className="text-lg" title={`Direction: ${lane}`}>
          {LANE_ARROWS[lane]}
        </span>
      </div>

      {/* Traffic light housing */}
      <div className={`light-housing ${isEmergency ? "emergency-light" : ""}`}>
        <div className={getBulbClass("red", color)} />
        <div className={getBulbClass("yellow", color)} />
        <div className={getBulbClass("green", color)} />
        <span
          className="font-orbitron text-xs font-bold mt-1 tracking-widest"
          style={{
            color:
              color === "GREEN" ? "#4ade80" : color === "YELLOW" ? "#fbbf24" : "#f43f5e",
          }}
        >
          {color}
        </span>
      </div>

      {/* Density bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="font-mono-tech text-slate-400">DENSITY</span>
          <span className="font-mono-tech" style={{ color: "#38bdf8" }}>
            {density.toFixed(1)}%
          </span>
        </div>
        <div className="density-track">
          <div
            className={`density-fill bg-gradient-to-r ${getDensityColor(density)}`}
            style={{ width: `${density}%` }}
          />
        </div>
      </div>

      {/* Vehicle count */}
      <div className="flex items-center justify-between w-full">
        <span className="font-mono-tech text-xs text-slate-500">VEHICLES</span>
        <span className="font-orbitron text-sm font-bold" style={{ color: "#e2f0ff" }}>
          {count}
        </span>
      </div>

      {/* Emergency badge */}
      {isEmergency && (
        <div
          className="w-full text-center rounded-lg py-1.5 font-orbitron text-xs font-bold tracking-widest"
          style={{
            background: "rgba(239, 68, 68, 0.2)",
            color: "#fca5a5",
            border: "1px solid rgba(239, 68, 68, 0.4)",
          }}
        >
          ⚡ PRIORITY CORRIDOR
        </div>
      )}
    </div>
  );
}
