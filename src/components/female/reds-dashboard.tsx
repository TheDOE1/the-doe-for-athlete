"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REDS_SIGNALS, REDS_PROTOCOLS, calculateREDSRisk } from "@/lib/data/female-physiology";
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert, Activity } from "lucide-react";

// ─── RED-S Risk Score Gauge ───────────────────────────────────────────────────

interface RiskGaugeProps {
  risk: "low" | "moderate" | "high";
}

function RiskGauge({ risk }: RiskGaugeProps) {
  const colors = {
    low:      { fill: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", label: "FAIBLE" },
    moderate: { fill: "#f59e0b", bg: "bg-amber-500/10",   text: "text-amber-400",   label: "MODÉRÉ" },
    high:     { fill: "#ef4444", bg: "bg-red-500/10",     text: "text-red-400",     label: "ÉLEVÉ" },
  };
  const col = colors[risk];
  const widthMap = { low: "w-1/3", moderate: "w-2/3", high: "w-full" };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">Risque RED-S</span>
        <span className={cn("font-bold text-sm", col.text)}>{col.label}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            risk === "low" ? "bg-emerald-500" : risk === "moderate" ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: risk === "low" ? "33%" : risk === "moderate" ? "66%" : "100%" }}
        />
      </div>
    </div>
  );
}

// ─── Screening Form ───────────────────────────────────────────────────────────

interface ScreeningFormData {
  amenorrheaMonths: number;
  ferritin: number | null;
  boneDensityScore: number | null;
  energyAvailability: number | null;
}

interface ScreeningFormProps {
  onSubmit: (data: ScreeningFormData) => void;
  playerName?: string;
}

function ScreeningForm({ onSubmit, playerName }: ScreeningFormProps) {
  const [data, setData] = useState<ScreeningFormData>({
    amenorrheaMonths: 0,
    ferritin: null,
    boneDensityScore: null,
    energyAvailability: null,
  });

  const risk = calculateREDSRisk({
    amenorrheaMonths: data.amenorrheaMonths,
    ferritin: data.ferritin,
    boneDensityScore: data.boneDensityScore,
    energyAvailability: data.energyAvailability,
  });

  return (
    <Card glass className={cn(
      "border",
      risk === "high" ? "border-red-800/50" : risk === "moderate" ? "border-amber-800/50" : "border-zinc-700/50"
    )}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className={cn(
            "h-4 w-4",
            risk === "high" ? "text-red-400" : risk === "moderate" ? "text-amber-400" : "text-emerald-400"
          )} />
          Dépistage RED-S{playerName ? ` — ${playerName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Aménorrhée */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-300">Mois d'aménorrhée</label>
            <span className={cn("text-sm font-bold", data.amenorrheaMonths >= 3 ? "text-red-400" : "text-white")}>
              {data.amenorrheaMonths} mois
            </span>
          </div>
          <input
            type="range" min={0} max={12} value={data.amenorrheaMonths}
            onChange={(e) => setData((d) => ({ ...d, amenorrheaMonths: Number(e.target.value) }))}
            className="w-full accent-pink-500"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>Cycle régulier</span>
            <span className="text-red-400">3 mois = alerte</span>
            <span>12 mois</span>
          </div>
        </div>

        {/* Ferritine */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Ferritine
            <span className="ml-2 text-xs text-zinc-500">(µg/L — cible athlète : &gt;40)</span>
          </label>
          <input
            type="number"
            placeholder="Ex: 35"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
            value={data.ferritin ?? ""}
            onChange={(e) => setData((d) => ({ ...d, ferritin: e.target.value ? Number(e.target.value) : null }))}
          />
          {data.ferritin !== null && data.ferritin < 20 && (
            <p className="mt-1 text-xs text-red-400">Ferritine critique (&lt;20) — Risque RED-S ↑</p>
          )}
        </div>

        {/* Densité osseuse */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            T-score densité osseuse
            <span className="ml-2 text-xs text-zinc-500">(normal : &gt;-1.0)</span>
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="Ex: -0.5"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
            value={data.boneDensityScore ?? ""}
            onChange={(e) => setData((d) => ({ ...d, boneDensityScore: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>

        {/* Disponibilité énergétique */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">
            Disponibilité énergétique
            <span className="ml-2 text-xs text-zinc-500">(kcal/kg MLG/j — seuil : &lt;30)</span>
          </label>
          <input
            type="number"
            placeholder="Ex: 42"
            className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-pink-500 focus:outline-none"
            value={data.energyAvailability ?? ""}
            onChange={(e) => setData((d) => ({ ...d, energyAvailability: e.target.value ? Number(e.target.value) : null }))}
          />
        </div>

        {/* Live risk assessment */}
        <RiskGauge risk={risk} />

        {/* Protocol actions */}
        {risk !== "low" && (
          <div className={cn(
            "rounded-lg border p-3 space-y-1.5",
            risk === "high" ? "border-red-800/50 bg-red-950/20" : "border-amber-800/50 bg-amber-950/10"
          )}>
            <p className={cn("text-xs font-semibold mb-2", risk === "high" ? "text-red-300" : "text-amber-300")}>
              Actions recommandées :
            </p>
            {REDS_PROTOCOLS.find((p) => p.riskLevel === risk)?.actions.map((action, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <AlertTriangle className={cn("mt-0.5 h-3 w-3 shrink-0", risk === "high" ? "text-red-400" : "text-amber-400")} />
                {action}
              </div>
            ))}
            {risk === "high" && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-red-300">Restrictions entraînement :</p>
                {REDS_PROTOCOLS.find((p) => p.riskLevel === "high")?.trainingRestrictions.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-200">
                    <XCircle className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={() => onSubmit(data)}
          className="w-full bg-pink-700 hover:bg-pink-600 text-white"
          size="md"
        >
          Enregistrer le dépistage
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Team RED-S Dashboard ─────────────────────────────────────────────────────

interface PlayerREDSData {
  id: string;
  name: string;
  risk: "low" | "moderate" | "high";
  blockHighImpact: boolean;
  amenorrheaMonths?: number;
}

interface TeamREDSDashboardProps {
  players: PlayerREDSData[];
}

function TeamREDSDashboard({ players }: TeamREDSDashboardProps) {
  const highRisk = players.filter((p) => p.risk === "high");
  const modRisk  = players.filter((p) => p.risk === "moderate");
  const lowRisk  = players.filter((p) => p.risk === "low");

  return (
    <Card glass className="border-zinc-700/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-pink-400" />
          Vue d'ensemble RED-S — Équipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Risque Élevé",  count: highRisk.length, color: "text-red-400",     bg: "bg-red-950/20 border-red-800/30"     },
            { label: "Risque Modéré", count: modRisk.length,  color: "text-amber-400",   bg: "bg-amber-950/10 border-amber-800/30" },
            { label: "Risque Faible", count: lowRisk.length,  color: "text-emerald-400", bg: "bg-emerald-950/10 border-emerald-800/30" },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={cn("rounded-lg border p-3 text-center", bg)}>
              <p className={cn("text-2xl font-black", color)}>{count}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Alert list */}
        {highRisk.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Alertes immédiates
            </p>
            {highRisk.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-lg bg-red-950/20 border border-red-800/30 px-3 py-2">
                <span className="text-sm font-medium text-white">{player.name}</span>
                <div className="flex items-center gap-2">
                  {player.blockHighImpact && (
                    <Badge className="bg-red-900/60 text-red-200 border-red-700/50 text-[10px]">
                      Impacts bloqués
                    </Badge>
                  )}
                  <Badge className="bg-red-900/40 text-red-300 border-red-800/40 text-[10px]">
                    ÉLEVÉ
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {modRisk.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-amber-400">Surveillance renforcée</p>
            {modRisk.map((player) => (
              <div key={player.id} className="flex items-center justify-between rounded-lg bg-amber-950/10 border border-amber-800/30 px-3 py-2">
                <span className="text-sm text-white">{player.name}</span>
                <Badge className="bg-amber-900/40 text-amber-300 border-amber-700/40 text-[10px]">MODÉRÉ</Badge>
              </div>
            ))}
          </div>
        )}

        {players.length === 0 && (
          <div className="flex flex-col items-center py-6 text-zinc-500">
            <CheckCircle className="h-8 w-8 mb-2 text-emerald-500/50" />
            <p className="text-sm">Aucune joueuse à risque identifiée.</p>
            <p className="text-xs mt-1">Complétez les dépistages pour obtenir une vue d'ensemble.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── RED-S Signals Reference ──────────────────────────────────────────────────

function REDSSignalsRef() {
  const [openCat, setOpenCat] = useState<string | null>(null);

  return (
    <Card glass className="border-red-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldAlert className="h-4 w-4 text-red-400" />
          Signaux d'alerte RED-S — Référence IOC 2018
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {REDS_SIGNALS.map((cat) => (
          <div key={cat.category} className="rounded-lg border border-zinc-700/50 overflow-hidden">
            <button
              onClick={() => setOpenCat(openCat === cat.category ? null : cat.category)}
              className="flex w-full items-center justify-between p-3 text-left hover:bg-zinc-800/30 transition-colors"
            >
              <span className="text-sm font-medium text-white">{cat.category}</span>
              <span className="text-xs text-zinc-500">
                {cat.signals.filter((s) => s.severity === "critical").length} critiques
              </span>
            </button>
            {openCat === cat.category && (
              <div className="border-t border-zinc-700/50 p-3 space-y-1.5">
                {cat.signals.map((signal, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {signal.severity === "critical" ? (
                      <XCircle className="h-3 w-3 shrink-0 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 shrink-0 text-amber-400" />
                    )}
                    <span className={signal.severity === "critical" ? "text-red-200" : "text-zinc-300"}>
                      {signal.label}
                    </span>
                    {signal.severity === "critical" && (
                      <Badge className="ml-auto bg-red-900/40 text-red-300 border-red-800/30 text-[10px]">
                        Critique
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Main RED-S Dashboard Export ─────────────────────────────────────────────

interface REDSDashboardProps {
  demoPlayers?: PlayerREDSData[];
}

export function REDSDashboard({ demoPlayers = [] }: REDSDashboardProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleScreeningSubmit = (data: ScreeningFormData) => {
    // TODO: Connect to tRPC mutation female.saveScreening
    console.log("Screening submitted:", data);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-red-500/10 p-2.5">
          <ShieldAlert className="h-5 w-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Dépistage RED-S</h2>
          <p className="text-sm text-zinc-400">
            Triade de l'athlète féminine — Détection précoce & protocoles d'alerte
          </p>
        </div>
      </div>

      {submitted && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-950/20 p-3">
          <p className="text-sm font-medium text-pink-300">Dépistage enregistré avec succès.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <TeamREDSDashboard players={demoPlayers} />
          <REDSSignalsRef />
        </div>
        <div>
          <ScreeningForm onSubmit={handleScreeningSubmit} playerName="Joueuse sélectionnée" />
        </div>
      </div>
    </div>
  );
}
