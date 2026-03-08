"use client";

interface EventEntry {
  time: string;
  message: string;
  type: "SIGNAL_UPDATE" | "EMERGENCY_OVERRIDE" | "DENSITY_UPDATE";
}

interface EventLogProps {
  events: EventEntry[];
}

const EVENT_COLORS = {
  EMERGENCY_OVERRIDE: { dot: "#ef4444", text: "#fca5a5", bg: "rgba(239, 68, 68, 0.08)" },
  SIGNAL_UPDATE: { dot: "#38bdf8", text: "#7dd3fc", bg: "rgba(56, 189, 248, 0.05)" },
  DENSITY_UPDATE: { dot: "#4ade80", text: "#86efac", bg: "rgba(74, 222, 128, 0.05)" },
};

const EVENT_ICONS = {
  EMERGENCY_OVERRIDE: "⚡",
  SIGNAL_UPDATE: "🔄",
  DENSITY_UPDATE: "📊",
};

export default function EventLog({ events }: EventLogProps) {
  return (
    <div
      className="rounded-2xl p-5 h-full flex flex-col corner-decor"
      style={{
        background: "rgba(8, 15, 35, 0.85)",
        border: "1px solid rgba(56, 189, 248, 0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-orbitron text-sm font-bold tracking-widest" style={{ color: "#38bdf8" }}>
          EVENT STREAM
        </h2>
        <span
          className="font-mono-tech text-xs px-2 py-0.5 rounded"
          style={{ background: "rgba(56,189,248,0.1)", color: "#64748b" }}
        >
          LAST {events.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {events.length === 0 && (
          <p className="font-mono-tech text-xs text-slate-600 text-center py-8">
            Awaiting events...
          </p>
        )}
        {events.map((entry, idx) => {
          const style = EVENT_COLORS[entry.type];
          return (
            <div
              key={idx}
              className="flex items-start gap-2.5 px-3 py-2 rounded-lg animate-slide-in"
              style={{ background: idx === 0 ? style.bg : "transparent" }}
            >
              <span className="text-xs mt-0.5 shrink-0">{EVENT_ICONS[entry.type]}</span>
              <div className="flex-1 min-w-0">
                <p
                  className="font-mono-tech text-xs leading-relaxed truncate"
                  style={{ color: idx === 0 ? style.text : "#475569" }}
                >
                  {entry.message}
                </p>
              </div>
              <span className="font-mono-tech text-xs shrink-0" style={{ color: "#334155" }}>
                {entry.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
