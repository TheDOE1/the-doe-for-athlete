"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CYCLE_PHASES, type CyclePhase } from "@/lib/data/female-physiology";

// ─── Circular Cycle Calendar ──────────────────────────────────────────────────
// SVG-based 28-day circular calendar showing cycle phases for a single player.

interface CircularCycleProps {
  currentDay: number;   // 1–28+
  playerName?: string;
  size?: number;        // px, default 220
}

const PHASE_ARCS: { phase: CyclePhase; startDay: number; endDay: number }[] = [
  { phase: "menstrual",  startDay: 1,  endDay: 5  },
  { phase: "follicular", startDay: 6,  endDay: 13 },
  { phase: "ovulatory",  startDay: 14, endDay: 16 },
  { phase: "luteal",     startDay: 17, endDay: 28 },
];

function polarToCartesian(
  cx: number, cy: number, r: number, angleDeg: number
): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(
  cx: number, cy: number, r: number,
  startDay: number, endDay: number,
  totalDays: number
): string {
  const startAngle = ((startDay - 1) / totalDays) * 360;
  const endAngle   = (endDay / totalDays) * 360;
  const [x1, y1] = polarToCartesian(cx, cy, r, startAngle);
  const [x2, y2] = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const PHASE_COLORS: Record<CyclePhase, { stroke: string; glow: string; label: string }> = {
  follicular: { stroke: "#10b981", glow: "#10b98140", label: "#6ee7b7" },
  ovulatory:  { stroke: "#ef4444", glow: "#ef444440", label: "#fca5a5" },
  luteal:     { stroke: "#f59e0b", glow: "#f59e0b40", label: "#fcd34d" },
  menstrual:  { stroke: "#71717a", glow: "#71717a40", label: "#d4d4d8" },
};

export function CircularCycle({ currentDay, playerName, size = 220 }: CircularCycleProps) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.42;
  const innerR = size * 0.30;
  const trackR  = size * 0.36;
  const dotR    = size * 0.015;
  const totalDays = 28;

  const currentAngle = ((currentDay - 1) / totalDays) * 360 - 90;
  const [dotX, dotY] = polarToCartesian(cx, cy, trackR, currentAngle + 90);

  const currentPhase: CyclePhase = useMemo(() => {
    if (currentDay <= 5) return "menstrual";
    if (currentDay <= 13) return "follicular";
    if (currentDay <= 16) return "ovulatory";
    return "luteal";
  }, [currentDay]);

  const phaseData = CYCLE_PHASES.find((p) => p.id === currentPhase)!;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-md"
        aria-label={`Cycle jour ${currentDay} — ${phaseData.name}`}
      >
        {/* ── Defs ── */}
        <defs>
          {PHASE_ARCS.map(({ phase }) => {
            const col = PHASE_COLORS[phase];
            return (
              <filter key={`glow-${phase}`} id={`glow-${phase}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>

        {/* ── Background ring ── */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#27272a" strokeWidth={size * 0.12} />

        {/* ── Phase arcs ── */}
        {PHASE_ARCS.map(({ phase, startDay, endDay }) => {
          const col = PHASE_COLORS[phase];
          return (
            <path
              key={phase}
              d={arcPath(cx, cy, trackR, startDay, endDay, totalDays)}
              fill="none"
              stroke={col.stroke}
              strokeWidth={size * 0.08}
              strokeLinecap="round"
              filter={currentPhase === phase ? `url(#glow-${phase})` : undefined}
              opacity={currentPhase === phase ? 1 : 0.45}
            />
          );
        })}

        {/* ── Day tick marks ── */}
        {Array.from({ length: 28 }, (_, i) => {
          const angle = (i / 28) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const isMajor = i % 7 === 0;
          const r1 = outerR - size * 0.005;
          const r2 = r1 - (isMajor ? size * 0.035 : size * 0.018);
          return (
            <line
              key={i}
              x1={cx + r1 * Math.cos(rad)}
              y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)}
              y2={cy + r2 * Math.sin(rad)}
              stroke={isMajor ? "#52525b" : "#3f3f46"}
              strokeWidth={isMajor ? 1.5 : 0.8}
            />
          );
        })}

        {/* ── Current day dot ── */}
        <circle
          cx={dotX}
          cy={dotY}
          r={size * 0.038}
          fill="white"
          stroke={PHASE_COLORS[currentPhase].stroke}
          strokeWidth={size * 0.015}
          filter={`url(#glow-${currentPhase})`}
        />

        {/* ── Center text ── */}
        <text
          x={cx}
          y={cy - size * 0.04}
          textAnchor="middle"
          fontSize={size * 0.16}
          fontWeight="700"
          fill="white"
          fontFamily="system-ui, sans-serif"
        >
          {currentDay}
        </text>
        <text
          x={cx}
          y={cy + size * 0.05}
          textAnchor="middle"
          fontSize={size * 0.06}
          fill="#a1a1aa"
          fontFamily="system-ui, sans-serif"
        >
          J{currentDay}
        </text>
        <text
          x={cx}
          y={cy + size * 0.14}
          textAnchor="middle"
          fontSize={size * 0.055}
          fontWeight="600"
          fill={PHASE_COLORS[currentPhase].label}
          fontFamily="system-ui, sans-serif"
        >
          {phaseData.name.split(" ")[1] ?? phaseData.name}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2">
        {PHASE_ARCS.map(({ phase }) => {
          const col   = PHASE_COLORS[phase];
          const label = CYCLE_PHASES.find((p) => p.id === phase)!.name;
          return (
            <div key={phase} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.stroke }} />
              <span
                className={cn(
                  "text-xs",
                  phase === currentPhase ? "font-semibold text-white" : "text-zinc-500"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
