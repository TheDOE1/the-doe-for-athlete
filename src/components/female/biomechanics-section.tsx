"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BIOMECHANICS_FACTORS, ANTI_VALGUS_PROGRAM } from "@/lib/data/female-physiology";
import { ChevronDown, ChevronUp, Dumbbell, AlertTriangle, CheckCircle } from "lucide-react";

// ─── Biomechanics Cards ───────────────────────────────────────────────────────

function QAngleDiagram({ size = 140 }: { size?: number }) {
  const cx = size * 0.5;
  const cy = size * 0.35;
  // Points: EIAS (hip), patella (knee), tibial tuberosity (shin)
  const hip   = { x: cx - size * 0.12, y: size * 0.08 };
  const knee  = { x: cx,               y: cy };
  const tibia = { x: cx + size * 0.08, y: size * 0.72 };

  // Quad line: hip → knee extension
  const quadEnd = { x: cx - size * 0.12, y: size * 0.7 };

  return (
    <svg width={size} height={size * 0.85} viewBox={`0 0 ${size} ${size * 0.85}`}>
      {/* Femur / tibia skeleton */}
      <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke="#52525b" strokeWidth="3" strokeLinecap="round" />
      <line x1={knee.x} y1={knee.y} x2={tibia.x} y2={tibia.y} stroke="#52525b" strokeWidth="3" strokeLinecap="round" />

      {/* Patella circle */}
      <circle cx={knee.x} cy={knee.y} r={size * 0.045} fill="#3f3f46" stroke="#71717a" strokeWidth="1.5" />

      {/* Quad force line (EIAS → patella direction) */}
      <line x1={hip.x} y1={hip.y} x2={quadEnd.x} y2={quadEnd.y} stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Patellar tendon (patella → tibia) */}
      <line x1={knee.x} y1={knee.y} x2={tibia.x} y2={tibia.y} stroke="#f59e0b" strokeWidth="2" />

      {/* Angle arc */}
      <path
        d={`M ${quadEnd.x} ${knee.y - size * 0.12} Q ${knee.x} ${knee.y - size * 0.08} ${tibia.x - size * 0.02} ${knee.y + size * 0.1}`}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.5"
        opacity="0.7"
      />

      {/* Q label */}
      <text x={knee.x + size * 0.06} y={knee.y - size * 0.02} fontSize={size * 0.1} fill="#fcd34d" fontWeight="bold">Q</text>

      {/* Labels */}
      <text x={hip.x - size * 0.08} y={hip.y + size * 0.04} fontSize={size * 0.075} fill="#a1a1aa">EIAS</text>
      <text x={tibia.x + size * 0.04} y={tibia.y + size * 0.04} fontSize={size * 0.075} fill="#a1a1aa">TT</text>
    </svg>
  );
}

function ValgusKneeDiagram({ size = 120 }: { size?: number }) {
  const cx = size * 0.5;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Femur — slanted inward (valgus) */}
      <line x1={cx - size * 0.15} y1={size * 0.1} x2={cx} y2={size * 0.48} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      {/* Tibia — continuing outward */}
      <line x1={cx} y1={size * 0.52} x2={cx + size * 0.1} y2={size * 0.9} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      {/* Knee joint */}
      <circle cx={cx} cy={size * 0.5} r={size * 0.05} fill="#27272a" stroke="#ef4444" strokeWidth="2" />
      {/* Correct alignment (ghosted) */}
      <line x1={cx + size * 0.2} y1={size * 0.1} x2={cx + size * 0.2} y2={size * 0.9} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.6" />
      {/* Arrow showing valgus */}
      <path d={`M ${cx - size * 0.05} ${size * 0.48} L ${cx + size * 0.12} ${size * 0.48}`} stroke="#ef4444" strokeWidth="1" fill="none" markerEnd="url(#arrow)" />
      {/* Labels */}
      <text x={cx - size * 0.38} y={size * 0.5} fontSize={size * 0.1} fill="#fca5a5" fontWeight="600">Valgus</text>
    </svg>
  );
}

interface BiomechanicsCardProps {
  factorId: string;
}

function BiomechanicsCard({ factorId }: BiomechanicsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const factor = BIOMECHANICS_FACTORS.find((f) => f.id === factorId);
  if (!factor) return null;

  return (
    <Card glass className="overflow-hidden border-pink-900/30">
      <div className="bg-gradient-to-r from-pink-950/30 to-purple-950/20 p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-white">{factor.name}</h3>
            <p className="mt-0.5 text-xs text-zinc-400">{factor.description.slice(0, 80)}…</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge className="bg-red-900/40 text-red-300 border border-red-800/40 text-xs">
              {factor.riskRatio}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/30 p-2">
            <p className="text-emerald-400 font-medium mb-0.5">Normal</p>
            <p className="text-zinc-300">{factor.normalValue}</p>
          </div>
          <div className="rounded-lg bg-red-950/20 border border-red-800/30 p-2">
            <p className="text-red-400 font-medium mb-0.5">Risque</p>
            <p className="text-zinc-300">{factor.riskValue}</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">{factor.explanation}</p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-pink-400 hover:text-pink-300 transition-colors"
        >
          <Dumbbell className="h-3 w-3" />
          {expanded ? "Masquer" : "Voir"} les exercices ({factor.exercises.length})
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {expanded && (
          <div className="space-y-2 border-t border-pink-900/30 pt-3">
            {factor.exercises.map((ex, i) => (
              <div key={i} className="rounded-lg bg-zinc-800/40 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{ex.name}</span>
                  <span className="text-xs text-pink-300">{ex.sets} × {ex.reps}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ex.cues.map((cue, j) => (
                    <span key={j} className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400">
                      {cue}
                    </span>
                  ))}
                </div>
                <span className="mt-1 inline-block text-[10px] text-purple-400">{ex.phase}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Anti-Valgus Program Summary ──────────────────────────────────────────────

function AntiValgusProgram() {
  const [openPhase, setOpenPhase] = useState<number | null>(0);
  const program = ANTI_VALGUS_PROGRAM;

  return (
    <Card glass className="border-purple-900/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Dumbbell className="h-4 w-4 text-purple-400" />
          {program.name}
        </CardTitle>
        <div className="flex gap-3 text-xs text-zinc-400 mt-1">
          <span>{program.frequency}</span>
          <span>·</span>
          <span>{program.duration}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {program.phases.map((phase, idx) => (
          <div key={idx} className="rounded-lg border border-zinc-700/50 overflow-hidden">
            <button
              onClick={() => setOpenPhase(openPhase === idx ? null : idx)}
              className="flex w-full items-center justify-between p-3 text-left hover:bg-zinc-800/30 transition-colors"
            >
              <span className="text-sm font-medium text-white">{phase.name}</span>
              {openPhase === idx ? (
                <ChevronUp className="h-4 w-4 text-zinc-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              )}
            </button>
            {openPhase === idx && (
              <div className="border-t border-zinc-700/50 p-3 space-y-2">
                {phase.exercises.map((ex, j) => (
                  <div key={j} className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-white">{ex.name}</p>
                      <p className="text-[11px] text-purple-300 mt-0.5">{ex.focus}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-purple-900/30 px-2 py-0.5 text-[11px] font-medium text-purple-300">
                      {ex.protocol}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="mt-3 rounded-lg bg-purple-950/20 border border-purple-800/30 p-3 text-xs text-zinc-400 leading-relaxed">
          <strong className="text-purple-300">Evidence : </strong>{program.evidence}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Biomechanics Section ────────────────────────────────────────────────

export function BiomechanicsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-500/10 p-2.5">
          <AlertTriangle className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Biomécanique Préventive LCA</h2>
          <p className="text-sm text-zinc-400">
            Facteurs de risque anatomiques & programme de prévention validé scientifiquement
          </p>
        </div>
      </div>

      {/* Diagrams row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card glass className="p-4 flex flex-col items-center gap-2 border-zinc-700/50">
          <QAngleDiagram size={120} />
          <p className="text-xs text-center text-zinc-400">Angle Q — force de cisaillement latérale sur l'ACL</p>
        </Card>
        <Card glass className="p-4 flex flex-col items-center gap-2 border-zinc-700/50">
          <ValgusKneeDiagram size={100} />
          <p className="text-xs text-center text-zinc-400">Valgus dynamique — effondrement à l'atterrissage</p>
        </Card>
        <Card glass className="col-span-2 p-4 border-red-900/20 bg-red-950/10">
          <p className="text-xs font-semibold text-red-300 mb-2">Risque LCA Féminin — Chiffres Clés</p>
          <div className="space-y-2">
            {[
              { stat: "×3", label: "Risque rupture LCA vs hommes (même sport)" },
              { stat: "×2.4", label: "Risque accru en phase ovulatoire (relaxine)" },
              { stat: "51%", label: "Réduction blessures IJ avec Nordic Curl" },
              { stat: "64%", label: "Réduction blessures LCA avec FIFA 11+ complet" },
            ].map(({ stat, label }) => (
              <div key={stat} className="flex items-center gap-3">
                <span className="text-xl font-black text-red-400 w-12 shrink-0">{stat}</span>
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Factor cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {BIOMECHANICS_FACTORS.map((factor) => (
          <BiomechanicsCard key={factor.id} factorId={factor.id} />
        ))}
      </div>

      {/* Anti-Valgus Program */}
      <AntiValgusProgram />
    </div>
  );
}
