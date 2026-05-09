"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Zap,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Activity,
  BookOpen,
  Target,
  Timer,
  TrendingUp,
  Users,
  Heart,
  Info,
  Dumbbell,
} from "lucide-react";
import {
  generatePreseasonPhases,
  calculateDomsRisk,
  vmaPercentToDescription,
  type PreseasonInput,
  type GeneratedPhase,
} from "@/lib/algorithms/preseason";

// ─── Types ─────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3;

interface WizardData {
  playerSex: "male" | "female" | null;
  totalWeeks: number;
  weeksOff: number;
  chronicLoadBaseline: number;
  hqRatio: number;
}

// ─── Step Indicators ──────────────────────────────────────────────────────────

function StepDot({ step, current, done }: { step: number; current: WizardStep; done: boolean }) {
  const isActive = step === current;
  const isPast = done || step < current;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
          isActive
            ? "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30"
            : isPast
            ? "border-emerald-500 bg-emerald-600 text-white"
            : "border-zinc-700 bg-zinc-800 text-zinc-500"
        )}
      >
        {isPast && !isActive ? <CheckCircle className="h-5 w-5" /> : step}
      </div>
    </div>
  );
}

// ─── Wizard Step 1 : Sexe & Semaines d'arrêt ──────────────────────────────────

function Step1({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Profil de l'équipe</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Ces informations déterminent les adaptations physiologiques prioritaires et les risques spécifiques.
        </p>
      </div>

      {/* Sex */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">Sexe des athlètes</label>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((sex) => (
            <button
              key={sex}
              onClick={() => onChange({ playerSex: sex })}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-sm font-medium transition-all",
                data.playerSex === sex
                  ? sex === "male"
                    ? "border-blue-500 bg-blue-900/30 text-blue-300"
                    : "border-pink-500 bg-pink-900/30 text-pink-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"
              )}
            >
              <span className="text-3xl">{sex === "male" ? "♂" : "♀"}</span>
              <span>{sex === "male" ? "Masculin" : "Féminin"}</span>
              {sex === "female" && (
                <span className="text-xs text-zinc-500 text-center leading-tight">
                  Protocole adapté risque ACL
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Weeks off */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Semaines d'arrêt avant la pré-saison
          <span className="ml-2 font-bold text-blue-400">{data.weeksOff} sem.</span>
        </label>
        <input
          type="range"
          min={0}
          max={16}
          value={data.weeksOff}
          onChange={(e) => onChange({ weeksOff: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>0 (maintien)</span>
          <span>4 (vacances)</span>
          <span>8 (longue pause)</span>
          <span>16 (arrêt complet)</span>
        </div>
        {data.weeksOff > 6 && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-700/30 bg-amber-900/10 p-3 text-xs text-amber-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Arrêt prolongé — La Phase 1 sera renforcée avec du conditionnement tissulaire progressif.
          </div>
        )}
      </div>

      {/* Total weeks */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Durée totale de la pré-saison
          <span className="ml-2 font-bold text-blue-400">{data.totalWeeks} sem.</span>
        </label>
        <input
          type="range"
          min={4}
          max={10}
          value={data.totalWeeks}
          onChange={(e) => onChange({ totalWeeks: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>4 (court)</span>
          <span>6 (standard)</span>
          <span>8 (long)</span>
          <span>10 (optimal)</span>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard Step 2 : Charge chronique & H:Q ───────────────────────────────────

function Step2({ data, onChange }: { data: WizardData; onChange: (d: Partial<WizardData>) => void }) {
  const hqCategory =
    data.hqRatio < 0.55 ? { label: "Très faible — Risque élevé", color: "text-red-400" }
    : data.hqRatio < 0.65 ? { label: "Faible — Surveillance recommandée", color: "text-amber-400" }
    : data.hqRatio < 0.75 ? { label: "Normal", color: "text-emerald-400" }
    : { label: "Élevé — Bon équilibre", color: "text-blue-400" };

  const loadCategory =
    data.chronicLoadBaseline < 200 ? "Faible (débutant / longue pause)"
    : data.chronicLoadBaseline < 400 ? "Modérée (entraîné / 2-3 séances/sem)"
    : data.chronicLoadBaseline < 600 ? "Élevée (entraîné haut niveau)"
    : "Très élevée (professionnel)";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Profil de charge & Force musculaire</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Ces données calibrent l'intensité de départ et identifient les déséquilibres prioritaires.
        </p>
      </div>

      {/* Chronic load */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">Charge chronique de base (sRPE)</label>
          <span className="text-base font-bold text-blue-400">{data.chronicLoadBaseline} UA</span>
        </div>
        <input
          type="range"
          min={50}
          max={800}
          step={25}
          value={data.chronicLoadBaseline}
          onChange={(e) => onChange({ chronicLoadBaseline: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <p className="mt-1 text-xs text-zinc-500">{loadCategory}</p>
        <div className="mt-2 rounded-lg bg-zinc-800/40 p-3 text-xs text-zinc-400">
          <strong className="text-zinc-300">Calcul sRPE :</strong> RPE (1–10) × durée session (min). Exemple : RPE 7 × 60 min = 420 UA.
          La charge chronique représente votre moyenne sur les 4 dernières semaines d'entraînement.
        </div>
      </div>

      {/* H:Q ratio */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">Ratio Ischio-Jambiers / Quadriceps (H:Q)</label>
          <span className={cn("text-base font-bold", hqCategory.color)}>{data.hqRatio.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.40}
          max={0.90}
          step={0.01}
          value={data.hqRatio}
          onChange={(e) => onChange({ hqRatio: Number(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>0.40</span>
          <span>0.60 (norm)</span>
          <span>0.90</span>
        </div>
        <p className={cn("mt-1 text-xs font-medium", hqCategory.color)}>{hqCategory.label}</p>
        {data.hqRatio < 0.6 && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-700/30 bg-red-900/10 p-3 text-xs text-red-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Déséquilibre musculaire détecté. Le renforcement excentrique des ischio-jambiers (Nordic Curl) sera priorisé dès la semaine 1.
          </div>
        )}
        <div className="mt-2 rounded-lg bg-zinc-800/40 p-3 text-xs text-zinc-400">
          <strong className="text-zinc-300">Mesure :</strong> Test isocinétique (Cybex/Biodex) à 60°/s. Valeur normale en football : 0.60–0.65.
          En l'absence de test, utiliser 0.60 par défaut.
        </div>
      </div>
    </div>
  );
}

// ─── Wizard Step 3 : Confirmation ─────────────────────────────────────────────

function Step3({ data }: { data: WizardData }) {
  const items = [
    { label: "Sexe", value: data.playerSex === "male" ? "Masculin" : "Féminin" },
    { label: "Semaines pré-saison", value: `${data.totalWeeks} semaines` },
    { label: "Semaines d'arrêt", value: `${data.weeksOff} semaines` },
    { label: "Charge chronique", value: `${data.chronicLoadBaseline} UA` },
    { label: "Ratio H:Q", value: data.hqRatio.toFixed(2) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Confirmation & Génération</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Vérifiez les paramètres avant de générer votre plan pré-saison personnalisé.
        </p>
      </div>

      <Card className="border-zinc-700 bg-zinc-900/40 p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-lg bg-zinc-800/60 p-3">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className="mt-0.5 font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-start gap-2 rounded-lg border border-blue-700/30 bg-blue-900/10 p-3 text-sm text-blue-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        L'algorithme va générer un plan en 3 phases adapté à ces paramètres, avec objectifs physiologiques,
        exercices clés, dimensions SSG et charges VBT.
      </div>
    </div>
  );
}

// ─── Phase Card ────────────────────────────────────────────────────────────────

function PhaseCard({ phase, startDate, weeksOff }: { phase: GeneratedPhase; startDate: string; weeksOff: number }) {
  const [expanded, setExpanded] = useState(false);

  const phaseColors = [
    { border: "border-blue-700/40", header: "from-blue-900/40 to-blue-900/10", badge: "bg-blue-900/40 text-blue-300 border-blue-700/40", dot: "bg-blue-500" },
    { border: "border-violet-700/40", header: "from-violet-900/40 to-violet-900/10", badge: "bg-violet-900/40 text-violet-300 border-violet-700/40", dot: "bg-violet-500" },
    { border: "border-emerald-700/40", header: "from-emerald-900/40 to-emerald-900/10", badge: "bg-emerald-900/40 text-emerald-300 border-emerald-700/40", dot: "bg-emerald-500" },
  ];
  const col = phaseColors[(phase.phaseNumber - 1) % phaseColors.length]!;

  const domsRisk = calculateDomsRisk(
    phase.weeksStart,
    phase,
    weeksOff,
    phase.keyMetrics.targetLoad * 0.8,
    phase.keyMetrics.targetLoad
  );
  const domsColor = domsRisk >= 70 ? "text-red-400" : domsRisk >= 40 ? "text-amber-400" : "text-emerald-400";
  const domsBarColor = domsRisk >= 70 ? "bg-red-500" : domsRisk >= 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card glass className={cn("border overflow-hidden", col.border)}>
      <div className={cn("bg-gradient-to-r p-5", col.header)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("mt-1 h-3 w-3 rounded-full shrink-0", col.dot)} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", col.badge)}>
                  Phase {phase.phaseNumber}
                </span>
                <span className="text-xs text-zinc-500">
                  Sem. {phase.weeksStart}–{phase.weeksEnd}
                </span>
              </div>
              <h3 className="mt-1 text-base font-bold text-white">{phase.name}</h3>
              <p className="mt-0.5 text-xs text-zinc-400">{phase.focus}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Séances/sem</p>
            <p className="text-lg font-bold text-white">{phase.sessionsPerWeek}</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* DOMS risk gauge */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Risque DOMS</span>
            <span className={cn("font-semibold", domsColor)}>{domsRisk}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800">
            <div
              className={cn("h-2 rounded-full transition-all", domsBarColor)}
              style={{ width: `${domsRisk}%` }}
            />
          </div>
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-zinc-800/40 px-3 py-2">
            <p className="text-zinc-500">%VMA cible</p>
            <p className="font-semibold text-white mt-0.5">{phase.keyMetrics.vmaPercent[0]}–{phase.keyMetrics.vmaPercent[1]}%</p>
            <p className="text-zinc-500 mt-0.5 text-[10px] leading-tight">
              {vmaPercentToDescription(phase.keyMetrics.vmaPercent[0]!, phase.keyMetrics.vmaPercent[1]!)}
            </p>
          </div>
          <div className="rounded-lg bg-zinc-800/40 px-3 py-2">
            <p className="text-zinc-500">Charge cible</p>
            <p className="font-semibold text-white mt-0.5">{phase.keyMetrics.targetLoad} UA</p>
            <p className="text-zinc-500 mt-0.5 text-[10px] leading-tight">{phase.keyMetrics.loadProgression}</p>
          </div>
          {phase.keyMetrics.vbtVelocity && (
            <div className="rounded-lg bg-zinc-800/40 px-3 py-2">
              <p className="text-zinc-500">VBT Vitesse</p>
              <p className="font-semibold text-white mt-0.5">{phase.keyMetrics.vbtVelocity}</p>
            </div>
          )}
          {phase.keyMetrics.ssgDimensions && (
            <div className="rounded-lg bg-zinc-800/40 px-3 py-2">
              <p className="text-zinc-500">SSG Dimensions</p>
              <p className="font-semibold text-white mt-0.5">{phase.keyMetrics.ssgDimensions}</p>
            </div>
          )}
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <div className="rounded-lg border border-blue-800/30 bg-blue-950/10 p-3">
            <p className="text-xs font-medium text-blue-300 mb-1 flex items-center gap-1">
              <Activity className="h-3 w-3" /> Cible physiologique
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">{phase.physiologyTarget}</p>
          </div>
          <div className="rounded-lg border border-violet-800/30 bg-violet-950/10 p-3">
            <p className="text-xs font-medium text-violet-300 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" /> Cible conditionnement
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed">{phase.conditioningTarget}</p>
          </div>
        </div>

        {/* Key exercises */}
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-400 flex items-center gap-1">
            <Dumbbell className="h-3 w-3" /> Exercices clés
          </p>
          <div className="space-y-1">
            {phase.keyExercises.slice(0, expanded ? undefined : 3).map((ex, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                <span className="text-zinc-300">{ex}</span>
              </div>
            ))}
            {phase.keyExercises.length > 3 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {expanded ? "Voir moins" : `+${phase.keyExercises.length - 3} exercices`}
              </button>
            )}
          </div>
        </div>

        {/* Science explanation */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
        >
          <BookOpen className="h-3 w-3" />
          {expanded ? "Masquer" : "Voir"} la justification scientifique
        </button>
        {expanded && (
          <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-3 text-xs text-zinc-300 leading-relaxed">
            {phase.scienceExplanation}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Timeline Visual ──────────────────────────────────────────────────────────

function PlanTimeline({ phases, totalWeeks }: { phases: GeneratedPhase[]; totalWeeks: number }) {
  const colorBars = [
    "bg-gradient-to-r from-blue-600 to-blue-500",
    "bg-gradient-to-r from-violet-600 to-violet-500",
    "bg-gradient-to-r from-emerald-600 to-emerald-500",
  ];

  return (
    <Card glass className="p-5">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Timer className="h-4 w-4 text-blue-400" />
          Timeline — {totalWeeks} semaines
        </CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {/* Week scale */}
        <div className="flex text-xs text-zinc-600">
          {Array.from({ length: totalWeeks }).map((_, i) => (
            <div key={i} className="flex-1 text-center">{i + 1}</div>
          ))}
        </div>
        {/* Phase bars */}
        {phases.map((phase, idx) => {
          const startFrac = (phase.weeksStart - 1) / totalWeeks;
          const widthFrac = (phase.weeksEnd - phase.weeksStart + 1) / totalWeeks;
          return (
            <div key={phase.phaseNumber} className="relative">
              <div className="relative flex h-9 w-full rounded overflow-hidden bg-zinc-800/30">
                <div
                  className={cn("absolute top-0 bottom-0 rounded flex items-center px-3", colorBars[idx % colorBars.length])}
                  style={{
                    left: `${startFrac * 100}%`,
                    width: `${widthFrac * 100}%`,
                  }}
                >
                  <span className="text-xs font-medium text-white truncate">
                    P{phase.phaseNumber} — {phase.name}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {/* Load progression curve description */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-center text-zinc-500">
          <div className="rounded bg-zinc-800/40 py-1">Volume ↑↑ / Intensité ↓</div>
          <div className="rounded bg-zinc-800/40 py-1">Volume ↑ / Intensité ↑</div>
          <div className="rounded bg-zinc-800/40 py-1">Volume ↓ / Intensité ↑↑</div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { step: 1, label: "Profil équipe" },
  { step: 2, label: "Charge & Force" },
  { step: 3, label: "Confirmation" },
];

export default function PreseasonPage() {
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [wizardDone, setWizardDone] = useState(false);
  const [wizardData, setWizardData] = useState<WizardData>({
    playerSex: null,
    totalWeeks: 6,
    weeksOff: 6,
    chronicLoadBaseline: 350,
    hqRatio: 0.62,
  });

  const updateData = (d: Partial<WizardData>) => setWizardData((prev) => ({ ...prev, ...d }));

  const canNext =
    currentStep === 1 ? wizardData.playerSex !== null :
    currentStep === 2 ? true : true;

  const generatedPlan = useMemo(() => {
    if (!wizardDone || !wizardData.playerSex) return null;
    return generatePreseasonPhases({
      totalWeeks: wizardData.totalWeeks,
      startDate: new Date().toISOString().split("T")[0]!,
      playerSex: wizardData.playerSex,
      chronicLoadBaseline: wizardData.chronicLoadBaseline,
      hqRatio: wizardData.hqRatio,
      weeksOff: wizardData.weeksOff,
    });
  }, [wizardDone, wizardData]);

  const handleGenerate = () => {
    setWizardDone(true);
  };

  const handleReset = () => {
    setWizardDone(false);
    setCurrentStep(1);
    setWizardData({
      playerSex: null,
      totalWeeks: 6,
      weeksOff: 6,
      chronicLoadBaseline: 350,
      hqRatio: 0.62,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-yellow-400" />
            Master Pré-Saison
          </h1>
          <p className="mt-1 text-zinc-400">
            Algorithme de périodisation personnalisé — VBT, SSG & phases physiologiques progressives
          </p>
        </div>
        <Badge variant="warning" className="gap-1 text-sm px-3 py-1">
          <Activity className="h-3.5 w-3.5" />
          Phase 3
        </Badge>
      </div>

      {!wizardDone ? (
        /* ── Wizard ── */
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Step indicators */}
          <Card glass className="p-5">
            <div className="relative flex items-center justify-between">
              {/* Connector line */}
              <div className="absolute left-8 right-8 top-5 h-0.5 bg-zinc-700">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />
              </div>
              {WIZARD_STEPS.map(({ step, label }) => (
                <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                  <StepDot step={step} current={currentStep} done={wizardDone} />
                  <span className={cn("text-xs font-medium mt-1", step === currentStep ? "text-blue-300" : "text-zinc-500")}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Step content */}
          <Card glass className="p-6">
            {currentStep === 1 && <Step1 data={wizardData} onChange={updateData} />}
            {currentStep === 2 && <Step2 data={wizardData} onChange={updateData} />}
            {currentStep === 3 && <Step3 data={wizardData} />}
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep((s) => (s > 1 ? ((s - 1) as WizardStep) : s))}
              disabled={currentStep === 1}
              className="gap-2 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep((s) => ((s + 1) as WizardStep))}
                disabled={!canNext}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
              >
                <Zap className="h-4 w-4" />
                Générer le plan
              </Button>
            )}
          </div>
        </div>
      ) : generatedPlan ? (
        /* ── Generated Plan ── */
        <div className="space-y-6">
          {/* Summary bar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Timer, label: "Durée totale", value: `${wizardData.totalWeeks} semaines`, color: "text-blue-400 bg-blue-500/10" },
              { icon: Users, label: "Profil", value: wizardData.playerSex === "male" ? "Masculin" : "Féminin", color: "text-violet-400 bg-violet-500/10" },
              { icon: TrendingUp, label: "Charge baseline", value: `${wizardData.chronicLoadBaseline} UA`, color: "text-emerald-400 bg-emerald-500/10" },
              { icon: Heart, label: "Ratio H:Q", value: wizardData.hqRatio.toFixed(2), color: "text-amber-400 bg-amber-500/10" },
            ].map((stat) => (
              <Card key={stat.label} glass className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg p-2", stat.color.split(" ")[1])}>
                    <stat.icon className={cn("h-4 w-4", stat.color.split(" ")[0])} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">{stat.label}</p>
                    <p className="text-base font-bold text-white">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Warnings */}
          {generatedPlan.warnings.length > 0 && (
            <Card className="border-amber-700/30 bg-amber-950/10 p-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                Points d'attention personnalisés
              </h3>
              <div className="space-y-1.5">
                {generatedPlan.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-200/80">
                    <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-amber-400" />
                    {w}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <PlanTimeline phases={generatedPlan.phases} totalWeeks={wizardData.totalWeeks} />

          {/* Phase cards */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {generatedPlan.phases.map((phase) => (
              <PhaseCard
                key={phase.phaseNumber}
                phase={phase}
                startDate={new Date().toISOString().split("T")[0]!}
                weeksOff={wizardData.weeksOff}
              />
            ))}
          </div>

          {/* Methodology note */}
          <Card glass className="border-zinc-700/50 p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <BookOpen className="h-4 w-4 text-blue-400" />
              Méthodologie & Références
            </h3>
            <div className="grid grid-cols-1 gap-3 text-xs text-zinc-400 sm:grid-cols-2">
              <div>
                <p className="font-medium text-zinc-300 mb-1">Périodisation des phases</p>
                <p>Buchheit & Laursen (2013) — HIIT en sports collectifs. Le découpage 33/34/33% correspond à la séquence optimale de conditionnement → force neurale → affûtage, validée en football professionnel (AS Saint-Etienne, PSG).</p>
              </div>
              <div>
                <p className="font-medium text-zinc-300 mb-1">VBT & SSG</p>
                <p>Morin & Samozino (2016) pour la prescription de charge VBT. Casamichana & Castellano (2010) pour les dimensions SSG (surface par joueur selon intensité cible).</p>
              </div>
              <div>
                <p className="font-medium text-zinc-300 mb-1">Ratio H:Q & Prévention</p>
                <p>Van der Horst et al. (2015) — Nordic Curl : réduction 51% blessures IJ. Harøy et al. (2019) — Copenhagen Plank : réduction 41% blessures aine.</p>
              </div>
              <div>
                <p className="font-medium text-zinc-300 mb-1">Affûtage (Phase 3)</p>
                <p>Bosquet et al. (2007, Med Sci Sports Exerc) — Meta-analyse tapering : réduction volume -40 à -60% + maintien intensité = gain performance +2.8%.</p>
              </div>
            </div>
          </Card>

          {/* Reset button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="gap-2 text-zinc-500 hover:text-white"
            >
              Reconfigurer le plan
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
