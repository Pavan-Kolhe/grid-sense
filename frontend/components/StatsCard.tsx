"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  accent?: string;
  subtext?: string;
}

export default function StatsCard({ label, value, unit, icon, accent = "#38bdf8", subtext }: StatsCardProps) {
  return (
    <div
      className="rounded-xl px-4 py-3.5 flex items-center gap-3 corner-decor"
      style={{
        background: "rgba(8, 15, 35, 0.85)",
        border: "1px solid rgba(56, 189, 248, 0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="text-xl shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono-tech text-xs mb-0.5" style={{ color: "#475569" }}>
          {label.toUpperCase()}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-orbitron text-xl font-bold" style={{ color: accent }}>
            {value}
          </span>
          {unit && (
            <span className="font-mono-tech text-xs" style={{ color: "#475569" }}>
              {unit}
            </span>
          )}
        </div>
        {subtext && (
          <p className="font-mono-tech text-xs mt-0.5" style={{ color: "#334155" }}>
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
