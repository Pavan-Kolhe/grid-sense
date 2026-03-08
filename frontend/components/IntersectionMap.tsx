"use client";

import type { Lane, LightColor } from "@/types/traffic";

interface IntersectionMapProps {
  lights: Record<Lane, LightColor>;
  densities: Record<Lane, number>;
  activeEmergency: boolean;
  emergencyLane?: Lane | null;
}

function getCarColor(count: number) {
  if (count === 0) return "#1e293b";
  if (count < 5) return "#0f4c75";
  if (count < 10) return "#1e6fa8";
  return "#38bdf8";
}

function LightDot({ color, emergency }: { color: LightColor; emergency: boolean }) {
  const bg = color === "GREEN" ? "#4ade80" : color === "YELLOW" ? "#fbbf24" : "#f43f5e";
  const glow = color === "GREEN"
    ? "0 0 8px #4ade80, 0 0 20px #4ade8055"
    : color === "YELLOW"
    ? "0 0 8px #fbbf24, 0 0 20px #fbbf2455"
    : emergency
    ? "0 0 12px #ef4444, 0 0 30px #ef444488"
    : "0 0 6px #f43f5e55";

  return (
    <div
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: bg,
        boxShadow: glow,
        transition: "all 0.5s ease",
        flexShrink: 0,
      }}
    />
  );
}

function DensityBar({
  density,
  direction,
}: {
  density: number;
  direction: "horizontal" | "vertical";
}) {
  const filled = Math.round(density / 10);
  const color =
    density < 30 ? "#4ade80" : density < 60 ? "#fbbf24" : density < 80 ? "#f97316" : "#f43f5e";

  const cells = Array.from({ length: 10 }, (_, i) => i < filled);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "horizontal" ? "row" : "column",
        gap: 2,
      }}
    >
      {cells.map((active, i) => (
        <div
          key={i}
          style={{
            width: direction === "horizontal" ? 6 : 8,
            height: direction === "horizontal" ? 8 : 6,
            borderRadius: 2,
            background: active ? color : "rgba(255,255,255,0.05)",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

export default function IntersectionMap({
  lights,
  densities,
  activeEmergency,
}: IntersectionMapProps) {
  const ROAD_COLOR = "rgba(30, 41, 59, 0.9)";
  const STRIPE_COLOR = "rgba(56, 189, 248, 0.12)";

  return (
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
          INTERSECTION MAP
        </h2>
        <span
          className="font-mono-tech text-xs px-2 py-0.5 rounded"
          style={{ background: "rgba(56,189,248,0.08)", color: "#38bdf8" }}
        >
          INT-001
        </span>
      </div>

      {/* Bird's eye intersection */}
      <div className="relative flex items-center justify-center" style={{ height: 260 }}>
        {/* Background city block grid hint */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            borderRadius: 12,
          }}
        />

        {/* City blocks */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 88, height: 88, background: "rgba(20,30,55,0.6)", borderRadius: "12px 0 0 0", border: "1px solid rgba(56,189,248,0.07)" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: 88, height: 88, background: "rgba(20,30,55,0.6)", borderRadius: "0 12px 0 0", border: "1px solid rgba(56,189,248,0.07)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: 88, height: 88, background: "rgba(20,30,55,0.6)", borderRadius: "0 0 0 12px", border: "1px solid rgba(56,189,248,0.07)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 88, height: 88, background: "rgba(20,30,55,0.6)", borderRadius: "0 0 12px 0", border: "1px solid rgba(56,189,248,0.07)" }} />

        {/* Horizontal road */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", transform: "translateY(-50%)", height: 84, background: ROAD_COLOR, zIndex: 1 }}>
          {/* Center dashed line */}
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 2, transform: "translateY(-50%)", background: `repeating-linear-gradient(90deg, ${STRIPE_COLOR} 0px, ${STRIPE_COLOR} 16px, transparent 16px, transparent 28px)` }} />
          {/* Lane dividers */}
          <div style={{ position: "absolute", top: "25%", left: 0, right: 0, height: 1, background: "rgba(56,189,248,0.05)" }} />
          <div style={{ position: "absolute", top: "75%", left: 0, right: 0, height: 1, background: "rgba(56,189,248,0.05)" }} />
        </div>

        {/* Vertical road */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", transform: "translateX(-50%)", width: 84, background: ROAD_COLOR, zIndex: 1 }}>
          {/* Center dashed line */}
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, transform: "translateX(-50%)", background: `repeating-linear-gradient(180deg, ${STRIPE_COLOR} 0px, ${STRIPE_COLOR} 16px, transparent 16px, transparent 28px)` }} />
          <div style={{ position: "absolute", left: "25%", top: 0, bottom: 0, width: 1, background: "rgba(56,189,248,0.05)" }} />
          <div style={{ position: "absolute", left: "75%", top: 0, bottom: 0, width: 1, background: "rgba(56,189,248,0.05)" }} />
        </div>

        {/* Intersection center box */}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 84, height: 84, background: ROAD_COLOR, zIndex: 2, border: `1px solid rgba(56,189,248,0.1)` }}>
          {/* Crosswalk hatching */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(45deg, rgba(56,189,248,0.04) 0px, rgba(56,189,248,0.04) 4px, transparent 4px, transparent 12px)` }} />
        </div>

        {/* NORTH light indicator */}
        <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span className="font-orbitron" style={{ fontSize: 9, color: "#38bdf8", letterSpacing: "0.1em" }}>N</span>
          <LightDot color={lights.North} emergency={activeEmergency} />
          <DensityBar density={densities.North} direction="horizontal" />
        </div>

        {/* SOUTH light indicator */}
        <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 5, display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 4 }}>
          <span className="font-orbitron" style={{ fontSize: 9, color: "#38bdf8", letterSpacing: "0.1em" }}>S</span>
          <LightDot color={lights.South} emergency={activeEmergency} />
          <DensityBar density={densities.South} direction="horizontal" />
        </div>

        {/* WEST light indicator */}
        <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 5, display: "flex", flexDirection: "row", alignItems: "center", gap: 4 }}>
          <span className="font-orbitron" style={{ fontSize: 9, color: "#38bdf8", letterSpacing: "0.1em" }}>W</span>
          <LightDot color={lights.West} emergency={activeEmergency} />
          <DensityBar density={densities.West} direction="vertical" />
        </div>

        {/* EAST light indicator */}
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 5, display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
          <span className="font-orbitron" style={{ fontSize: 9, color: "#38bdf8", letterSpacing: "0.1em" }}>E</span>
          <LightDot color={lights.East} emergency={activeEmergency} />
          <DensityBar density={densities.East} direction="vertical" />
        </div>

        {/* Center AI node */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: activeEmergency
              ? "radial-gradient(circle, #ef444455, #ef444422)"
              : "radial-gradient(circle, #38bdf855, #38bdf822)",
            border: `2px solid ${activeEmergency ? "#ef4444" : "#38bdf8"}`,
            boxShadow: activeEmergency
              ? "0 0 20px #ef444488, 0 0 40px #ef444444"
              : "0 0 15px #38bdf866, 0 0 30px #38bdf833",
            zIndex: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            transition: "all 0.5s",
          }}
        >
          🧠
        </div>

        {/* Emergency overlay pulse */}
        {activeEmergency && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 12,
              border: "2px solid rgba(239, 68, 68, 0.4)",
              animation: "emergencyBg 1s ease-in-out infinite",
              zIndex: 7,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {(["GREEN", "YELLOW", "RED"] as LightColor[]).map((c) => (
          <div key={c} className="flex items-center gap-1.5">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c === "GREEN" ? "#4ade80" : c === "YELLOW" ? "#fbbf24" : "#f43f5e",
              }}
            />
            <span className="font-mono-tech text-xs" style={{ color: "#475569" }}>{c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
