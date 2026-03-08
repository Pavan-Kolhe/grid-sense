"use client";

import { useState } from "react";
import type { Lane } from "@/types/traffic";

const LANES: Lane[] = ["North", "South", "East", "West"];

const LANE_ICONS: Record<Lane, string> = {
  North: "↑",
  South: "↓",
  East: "→",
  West: "←",
};

interface EmergencyPanelProps {
  activeEmergency: boolean;
  onTrigger: (lane: Lane) => Promise<void>;
}

export default function EmergencyPanel({ activeEmergency, onTrigger }: EmergencyPanelProps) {
  const [loading, setLoading] = useState<Lane | null>(null);
  const [lastTriggered, setLastTriggered] = useState<Lane | null>(null);

  const handleClick = async (lane: Lane) => {
    if (activeEmergency || loading) return;
    setLoading(lane);
    try {
      await onTrigger(lane);
      setLastTriggered(lane);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 corner-decor transition-all duration-500 ${
        activeEmergency ? "emergency-active" : ""
      }`}
      style={{
        background: activeEmergency ? "rgba(239, 68, 68, 0.06)" : "rgba(8, 15, 35, 0.85)",
        border: activeEmergency
          ? "1px solid rgba(239, 68, 68, 0.35)"
          : "1px solid rgba(56, 189, 248, 0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: activeEmergency ? "#fca5a5" : "#38bdf8" }}>
          EMERGENCY OVERRIDE
        </h2>
        {activeEmergency && (
          <div className="flex items-center gap-2">
            <div className="status-dot" style={{ background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "emergencyFlash 0.8s infinite" }} />
            <span className="font-orbitron text-xs font-bold" style={{ color: "#ef4444" }}>
              ACTIVE
            </span>
          </div>
        )}
      </div>

      {/* Active emergency banner */}
      {activeEmergency && (
        <div
          className="rounded-xl p-3 mb-4 text-center"
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <p className="font-orbitron text-xs font-bold tracking-widest" style={{ color: "#fca5a5" }}>
            ⚡ EMERGENCY CORRIDOR ACTIVE
          </p>
          <p className="font-mono-tech text-xs mt-1" style={{ color: "#ef4444" }}>
            All lanes holding until timeout
          </p>
        </div>
      )}

      {/* Description */}
      <p className="font-mono-tech text-xs mb-4" style={{ color: "#475569" }}>
        Triggers 30-second priority green corridor for selected lane. All other lanes hold RED.
      </p>

      {/* Lane buttons */}
      <div className="grid grid-cols-2 gap-2">
        {LANES.map((lane) => (
          <button
            key={lane}
            className="emergency-btn flex items-center justify-center gap-2"
            disabled={activeEmergency || loading !== null}
            onClick={() => handleClick(lane)}
          >
            {loading === lane ? (
              <span style={{ display: "inline-block", animation: "radarSpin 1s linear infinite" }}>⟳</span>
            ) : (
              <span>{LANE_ICONS[lane]}</span>
            )}
            <span>{lane.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Last triggered */}
      {lastTriggered && !activeEmergency && (
        <p className="font-mono-tech text-xs mt-3 text-center" style={{ color: "#334155" }}>
          Last: {lastTriggered} lane
        </p>
      )}

      {/* Info */}
      <div
        className="mt-4 rounded-lg p-2.5"
        style={{ background: "rgba(56,189,248,0.05)", border: "1px solid rgba(56,189,248,0.08)" }}
      >
        <p className="font-mono-tech text-xs leading-relaxed" style={{ color: "#334155" }}>
          Uses YOLOv8 ambulance detection + HSV colour mask for real deployment. Button simulates GPS trigger.
        </p>
      </div>
    </div>
  );
}
