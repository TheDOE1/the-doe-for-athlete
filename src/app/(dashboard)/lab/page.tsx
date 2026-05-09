"use client";

import { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter,
  ScatterChart,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Zap,
  Dumbbell,
  Target,
  TrendingUp,
  BookOpen,
  ChevronRight,
  Info,
  Activity,
  Timer,
  Star,
} from "lucide-react";
import {
  computeFVProfile,
  generateFVCurvePoints,
  getFVRecommendations,
  generateDemoFVProfile,
  type FVDeficit,
  type FVDataPoint,
} from "@/lib/algorithms/force-velocity";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "fv" | "exercises" | "pap";

interface Exercise {
  id: string;
  name: string;
  category: "strength" | "plyometric" | "speed" | "agility" | "prevention" | "recovery";
  muscleGroups: string[];
  equipment: string[];
  description: string;
  scienceRationale: string;
  difficulty: number;
  sportSpecificity: "low" | "medium" | "high";
  targetQuality?: string[];
}

interface PAPComplex {
  id: string;
  name: string;
  heavy: string;
  explosive: string;
  restSeconds: number;
  targetQuality: "power" | "speed" | "reactive_strength";
  sets: number;
  science: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_EXERCISES: Exercise[] = [
  {
    id: "e1",
    name: "Back Squat",
    category: "strength",
    muscleGroups: ["quadriceps", "gluteus", "hamstrings"],
    equipment: ["barre", "rack"],
    description: "Squat arrière avec barre, technique back squat haut ou bas selon morphologie.",
    scienceRationale:
      "Principal exercice de développement de la force des membres inférieurs. Active les quadriceps (EMG 85% MVC), les fessiers et les ischio-jambiers. Améliore le profil F-V côté force (↑F0). Référence : Escamilla et al., MSSE 2001.",
    difficulty: 3,
    sportSpecificity: "medium",
    targetQuality: ["Résistance duels", "Détente verticale"],
  },
  {
    id: "e2",
    name: "Nordic Curl",
    category: "prevention",
    muscleGroups: ["hamstrings"],
    equipment: ["banc", "partenaire"],
    description: "Flexion des genoux excentrique en position agenouillée, résistance maximale en descente.",
    scienceRationale:
      "Réduction de 51% du risque de blessure aux ischio-jambiers (van der Horst et al., BJSM 2015). Développe la force excentrique de pic en fin d'amplitude. Indispensable pour tout ratio H:Q < 0.6.",
    difficulty: 4,
    sportSpecificity: "high",
    targetQuality: ["Résistance duels"],
  },
  {
    id: "e3",
    name: "Drop Jump",
    category: "plyometric",
    muscleGroups: ["quadriceps", "gastrocnemius", "hamstrings"],
    equipment: ["box (20-40cm)"],
    description: "Chute contrôlée depuis une box, contact sol le plus bref possible avant saut vertical.",
    scienceRationale:
      "Le Drop Jump optimise l'index de force réactive (RSI = hauteur saut / temps contact). Améliore la stiffness tendineux et la réutilisation d'énergie élastique. Cible le cycle étirement-détente (SSC). Référence : Flanagan & Comyns, S&C 2008.",
    difficulty: 4,
    sportSpecificity: "high",
    targetQuality: ["Détente verticale", "Changement de direction"],
  },
  {
    id: "e4",
    name: "Hip Thrust",
    category: "strength",
    muscleGroups: ["gluteus maximus", "hamstrings"],
    equipment: ["barre", "banc"],
    description: "Extension de hanche avec barre, dos appuyé sur un banc.",
    scienceRationale:
      "Activation du grand fessier la plus élevée de tous les exercices de hanche (Contreras et al., 2015). Transfert direct sur la vitesse de sprint (corrélation r=0.74 avec vitesse 0-10m). Essentiel pour corriger un déficit de force dans le profil F-V.",
    difficulty: 2,
    sportSpecificity: "high",
    targetQuality: ["Résistance duels", "Détente verticale"],
  },
  {
    id: "e5",
    name: "Sprint libre décroissant",
    category: "speed",
    muscleGroups: ["quadriceps", "hamstrings", "gluteus"],
    equipment: [],
    description: "Series de sprints maximaux avec décélération progressive : 30m max → 20m → 10m.",
    scienceRationale:
      "Le sprint décroissant maintient la qualité neuromusculaire de chaque répétition. Développe la composante vitesse du profil F-V (↑V0). Récupération complète (3-5 min) obligatoire. Référence : Haugen et al., IJSPP 2019.",
    difficulty: 3,
    sportSpecificity: "high",
    targetQuality: ["Changement de direction"],
  },
  {
    id: "e6",
    name: "Copenhagen Plank",
    category: "prevention",
    muscleGroups: ["adductors", "core"],
    equipment: ["banc"],
    description: "Planche latérale avec jambe du dessus posée sur un banc, jambe du dessous en suspension.",
    scienceRationale:
      "Réduction de 41% des blessures à l'aine (Harøy et al., BJSM 2019). Développe la force isométrique des adducteurs dans une position fonctionnelle spécifique au football. 3 sessions/semaine pendant la pré-saison = protection optimale.",
    difficulty: 4,
    sportSpecificity: "high",
    targetQuality: ["Résistance duels"],
  },
  {
    id: "e7",
    name: "Box Jump",
    category: "plyometric",
    muscleGroups: ["quadriceps", "gluteus", "gastrocnemius"],
    equipment: ["box (40-70cm)"],
    description: "Saut vertical maximal sur une box, réception stable, descente contrôlée.",
    scienceRationale:
      "Développe la puissance concentrique des membres inférieurs. Phase d'impulsion < 250ms = recrutement maximal d'unités motrices rapides (Type IIx). Corrélé à la hauteur de détente verticale (r=0.81). Référence : Markovic et al., J Sports Sci 2007.",
    difficulty: 2,
    sportSpecificity: "medium",
    targetQuality: ["Détente verticale"],
  },
  {
    id: "e8",
    name: "Sled Push",
    category: "strength",
    muscleGroups: ["quadriceps", "gluteus", "calves"],
    equipment: ["traîneau lest"],
    description: "Poussée du traîneau chargé (10-40% BW) sur 20-30m, accélération maximale.",
    scienceRationale:
      "Le traîneau décale le profil F-V vers les vitesses faibles, ciblant la zone force-puissance. Améliore la phase d'accélération (0-10m). Charge optimale pour Pmax : 50% déclin de vitesse de sprint libre. Référence : Cross et al., IJSPP 2017.",
    difficulty: 2,
    sportSpecificity: "high",
    targetQuality: ["Changement de direction"],
  },
  {
    id: "e9",
    name: "Lateral Bound",
    category: "agility",
    muscleGroups: ["gluteus medius", "quadriceps", "adductors"],
    equipment: [],
    description: "Bond latéral maximal d'un pied à l'autre, réception mono-podale stable.",
    scienceRationale:
      "Développe la stabilité frontale et la puissance latérale. Directement transférable aux changements de direction (CoD) et aux dribbles explosifs. Améliore le SSC dans le plan frontal. Référence : Meylan et al., IJSPP 2009.",
    difficulty: 3,
    sportSpecificity: "high",
    targetQuality: ["Changement de direction"],
  },
  {
    id: "e10",
    name: "Foam Rolling + Mobilité Active",
    category: "recovery",
    muscleGroups: ["systémique"],
    equipment: ["rouleau mousse"],
    description: "Auto-massage myofascial + mobilisations actives des hanches et chevilles.",
    scienceRationale:
      "Le foam rolling réduit les DOMS de 48-72h post-effort (Pearcey et al., J Athl Train 2015). Améliore la ROM sans altérer la performance explosive (contrairement au stretching statique). Idéal en récupération J+1.",
    difficulty: 1,
    sportSpecificity: "low",
    targetQuality: [],
  },
];

const DEMO_PAP: PAPComplex[] = [
  {
    id: "pap1",
    name: "Complex Force-Puissance #1",
    heavy: "Back Squat (85% 1RM × 3)",
    explosive: "Box Jump maximal × 5",
    restSeconds: 240,
    targetQuality: "power",
    sets: 4,
    science:
      "Le PAP (Post-Activation Potentiation) exploite la phosphorylation des chaînes légères de myosine après une contraction lourde. Fenêtre optimale : 3-8 minutes de récupération. Amélioration de la hauteur de saut : +3-7%.",
  },
  {
    id: "pap2",
    name: "Complex Vitesse-Réactivité #1",
    heavy: "Hip Thrust (90% 1RM × 3)",
    explosive: "Sprint 20m maximal",
    restSeconds: 300,
    targetQuality: "speed",
    sets: 4,
    science:
      "Activation du recrutement des fibres de type II par une contraction isométrique-concentrique maximale. Amélioration du temps sur 10m : -2 à -5% observé chez les footballeurs. Repos 5 min entre séries.",
  },
  {
    id: "pap3",
    name: "Complex Réactivité SSC #1",
    heavy: "Squat isométrique contre cage (5s max)",
    explosive: "Drop Jump × 5 (30cm)",
    restSeconds: 180,
    targetQuality: "reactive_strength",
    sets: 3,
    science:
      "Potentialisation du réflexe myotatique et de la stiffness musculo-tendineuse. Améliore le RSI (Reactive Strength Index) de +8-12%. Idéal pour développer la détente verticale et la réactivité au sol.",
  },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-2 rounded-full",
            i < level
              ? "bg-blue-500"
              : "bg-zinc-700"
          )}
        />
      ))}
    </div>
  );
}

function MuscleTag({ name }: { name: string }) {
  const colorMap: Record<string, string> = {
    quadriceps: "bg-red-900/30 text-red-300 border-red-700/30",
    hamstrings: "bg-orange-900/30 text-orange-300 border-orange-700/30",
    gluteus: "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
    "gluteus maximus": "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
    "gluteus medius": "bg-amber-900/30 text-amber-300 border-amber-700/30",
    gastrocnemius: "bg-green-900/30 text-green-300 border-green-700/30",
    adductors: "bg-purple-900/30 text-purple-300 border-purple-700/30",
    core: "bg-blue-900/30 text-blue-300 border-blue-700/30",
    calves: "bg-teal-900/30 text-teal-300 border-teal-700/30",
    systémique: "bg-zinc-800 text-zinc-300 border-zinc-700/30",
  };
  const cls = colorMap[name.toLowerCase()] ?? "bg-zinc-800 text-zinc-300 border-zinc-700/30";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs", cls)}>
      {name}
    </span>
  );
}

function CategoryBadge({ category }: { category: Exercise["category"] }) {
  const map: Record<string, { label: string; cls: string }> = {
    strength: { label: "Force", cls: "bg-red-900/40 text-red-300" },
    plyometric: { label: "Plyométrie", cls: "bg-orange-900/40 text-orange-300" },
    speed: { label: "Vitesse", cls: "bg-yellow-900/40 text-yellow-300" },
    agility: { label: "Agilité", cls: "bg-green-900/40 text-green-300" },
    prevention: { label: "Prévention", cls: "bg-blue-900/40 text-blue-300" },
    recovery: { label: "Récupération", cls: "bg-purple-900/40 text-purple-300" },
  };
  const cfg = map[category]!;
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

// ─── FV Profile Tab ───────────────────────────────────────────────────────────

function FVProfileTab() {
  const [selectedDeficit, setSelectedDeficit] = useState<FVDeficit>("balanced");
  const [showScience, setShowScience] = useState(false);

  const { data: rawData, profile } = useMemo(
    () => generateDemoFVProfile(selectedDeficit),
    [selectedDeficit]
  );

  const curvePoints = useMemo(() => generateFVCurvePoints(profile), [profile]);
  const recommendations = useMemo(() => getFVRecommendations(profile), [profile]);

  const deficitConfig = {
    force: { label: "Déficit Force", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
    velocity: { label: "Déficit Vitesse", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
    balanced: { label: "Profil Équilibré", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  };
  const cfg = deficitConfig[profile.deficit];

  return (
    <div className="space-y-6">
      {/* Selector */}
      <Card glass className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-400">Simuler profil :</span>
          {(["balanced", "force", "velocity"] as FVDeficit[]).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDeficit(d)}
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                selectedDeficit === d
                  ? deficitConfig[d].bg + " " + deficitConfig[d].border + " " + deficitConfig[d].color
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-white"
              )}
            >
              {deficitConfig[d].label}
            </button>
          ))}
        </div>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "F0 — Force Max Théorique", value: `${profile.f0} N/kg`, icon: Dumbbell, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "V0 — Vitesse Max Théorique", value: `${profile.v0} m/s`, icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Pmax — Puissance Maximale", value: `${profile.pmax} W/kg`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Charge Optimale", value: `${profile.optimalLoad} N/kg`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((stat) => (
          <Card key={stat.label} glass className="p-4">
            <div className="flex items-start gap-3">
              <div className={cn("rounded-lg p-2", stat.bg)}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-500">{stat.label}</p>
                <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card glass className="p-6">
        <CardHeader className="p-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-400" />
                Droite Force-Vitesse & Courbe Puissance
              </CardTitle>
              <CardDescription className="mt-1">
                Profil de {rawData.length} points de mesure — Méthode Morin & Samozino (2016)
              </CardDescription>
            </div>
            <div className={cn("flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold", cfg.bg, cfg.border, cfg.color)}>
              {cfg.label}
            </div>
          </div>
        </CardHeader>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={curvePoints} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="powerGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="powerAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="velocity"
                type="number"
                domain={[0, "dataMax"]}
                tickCount={6}
                tick={{ fontSize: 11, fill: "#71717a" }}
                label={{ value: "Vitesse (m/s)", position: "insideBottom", offset: -2, fontSize: 11, fill: "#71717a" }}
              />
              <YAxis
                yAxisId="force"
                orientation="left"
                tick={{ fontSize: 11, fill: "#71717a" }}
                label={{ value: "Force (N/kg)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#71717a" }}
              />
              <YAxis
                yAxisId="power"
                orientation="right"
                tick={{ fontSize: 11, fill: "#71717a" }}
                label={{ value: "Puissance (W/kg)", angle: 90, position: "insideRight", offset: 10, fontSize: 11, fill: "#71717a" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#a1a1aa" }}
                formatter={(val, name) => [
                  typeof val === "number" ? val.toFixed(2) : String(val),
                  name === "force" ? "Force (N/kg)" : name === "power" ? "Puissance (W/kg)" : String(name),
                ]}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value) =>
                  value === "force" ? "Droite F-V" : value === "power" ? "Courbe Puissance" : value
                }
              />
              {/* Optimal load reference line at F0/2 */}
              <ReferenceLine
                yAxisId="force"
                x={profile.v0 / 2}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: "Zone Pmax", fontSize: 10, fill: "#f59e0b", position: "top" }}
              />
              {/* Power curve as Area */}
              <Area
                yAxisId="power"
                type="monotone"
                dataKey="power"
                fill="url(#powerAreaGradient)"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                name="power"
              />
              {/* F-V line */}
              <Line
                yAxisId="force"
                type="linear"
                dataKey="force"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
                name="force"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Raw data points */}
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <p className="mb-2 text-xs text-zinc-500">Points de mesure bruts</p>
          <div className="flex flex-wrap gap-2">
            {rawData.map((pt, i) => (
              <div key={i} className="rounded-lg bg-zinc-800/60 px-3 py-1.5 text-xs">
                <span className="text-zinc-400">V{i + 1}: </span>
                <span className="text-white font-medium">{pt.velocity} m/s</span>
                <span className="text-zinc-500 mx-1">|</span>
                <span className="text-white font-medium">{pt.force} N/kg</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card glass className={cn("border", cfg.border)}>
        <CardHeader className="pb-3">
          <CardTitle className={cn("flex items-center gap-2 text-base", cfg.color)}>
            <Target className="h-4 w-4" />
            Recommandations d'entraînement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-medium text-white">{recommendations.primary}</p>
          <p className="text-sm text-zinc-400">{recommendations.secondary}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 pt-2">
            {recommendations.exercises.map((ex, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-zinc-800/40 px-3 py-2 text-sm">
                <ChevronRight className="h-3 w-3 shrink-0 text-blue-400" />
                <span className="text-zinc-200">{ex}</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-amber-700/30 bg-amber-900/10 p-3 text-xs text-amber-300">
            <span className="font-medium">Attention : </span>
            {recommendations.avoidance}
          </div>
        </CardContent>
      </Card>

      {/* Science explanation toggle */}
      <button
        onClick={() => setShowScience((v) => !v)}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors"
      >
        <BookOpen className="h-4 w-4" />
        {showScience ? "Masquer" : "Afficher"} la justification scientifique
        <ChevronRight className={cn("h-3 w-3 transition-transform", showScience && "rotate-90")} />
      </button>
      {showScience && (
        <Card className="border-zinc-700 bg-zinc-900/50 p-4 text-sm">
          <p className="text-zinc-300 leading-relaxed">
            Le <strong className="text-white">Profil Force-Vitesse (Morin & Samozino, 2016)</strong> est
            construit à partir d'une régression linéaire sur des paires (vitesse, force) obtenues lors de
            sprints chargés ou d'exercices à différentes vitesses. La droite F-V extrapole :
          </p>
          <ul className="mt-2 space-y-1 text-zinc-400">
            <li>• <strong className="text-zinc-200">F0</strong> : Force maximale théorique à vitesse nulle</li>
            <li>• <strong className="text-zinc-200">V0</strong> : Vitesse maximale théorique à force nulle</li>
            <li>• <strong className="text-zinc-200">Pmax</strong> = F0 × V0 / 4 (sommet de la parabole puissance)</li>
            <li>• <strong className="text-zinc-200">SFV</strong> : Pente de la droite (N·s/m/kg) — mesure l'équilibre</li>
            <li>• <strong className="text-zinc-200">DRF</strong> : Ratio pente actuelle / pente optimale théorique</li>
          </ul>
          <p className="mt-2 text-zinc-400">
            L'optimisation passe par l'alignment de SFV sur SFVopt (-F0/V0), maximisant ainsi Pmax
            pour un niveau de F0×V0 donné. Référence : <em>Morin JB & Samozino P, IJSPP 2016</em>.
          </p>
        </Card>
      )}
    </div>
  );
}

// ─── Exercise Library Tab ─────────────────────────────────────────────────────

type ExerciseFilter = {
  category: Exercise["category"] | "all";
  target: string;
  search: string;
};

function ExerciseLibraryTab() {
  const [filters, setFilters] = useState<ExerciseFilter>({
    category: "all",
    target: "all",
    search: "",
  });
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories: Array<{ value: ExerciseFilter["category"]; label: string }> = [
    { value: "all", label: "Tous" },
    { value: "strength", label: "Force" },
    { value: "plyometric", label: "Plyométrie" },
    { value: "speed", label: "Vitesse" },
    { value: "agility", label: "Agilité" },
    { value: "prevention", label: "Prévention" },
    { value: "recovery", label: "Récupération" },
  ];

  const targets = ["all", "Détente verticale", "Changement de direction", "Résistance duels"];

  const filtered = useMemo(() => {
    return DEMO_EXERCISES.filter((ex) => {
      if (filters.category !== "all" && ex.category !== filters.category) return false;
      if (filters.target !== "all" && !ex.targetQuality?.includes(filters.target)) return false;
      if (filters.search && !ex.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card glass className="p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilters((f) => ({ ...f, category: cat.value }))}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                filters.category === cat.value
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {targets.map((t) => (
            <button
              key={t}
              onClick={() => setFilters((f) => ({ ...f, target: t }))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                filters.target === t
                  ? "border-purple-500/50 bg-purple-900/30 text-purple-300"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-white"
              )}
            >
              {t === "all" ? "Tous objectifs" : t}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Rechercher un exercice..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
        />
      </Card>

      {/* Count */}
      <p className="text-sm text-zinc-500">{filtered.length} exercice{filtered.length !== 1 ? "s" : ""}</p>

      {/* Exercise cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filtered.map((ex) => (
          <Card
            key={ex.id}
            glass
            className="overflow-hidden transition-all hover:border-zinc-600"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{ex.name}</h3>
                    <CategoryBadge category={ex.category} />
                    <Badge variant={ex.sportSpecificity === "high" ? "success" : ex.sportSpecificity === "medium" ? "info" : "default"}>
                      {ex.sportSpecificity === "high" ? "Spécifique" : ex.sportSpecificity === "medium" ? "Semi-spéc." : "Général"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{ex.description}</p>
                </div>
                <DifficultyDots level={ex.difficulty} />
              </div>

              {/* Muscle groups */}
              <div className="mt-3 flex flex-wrap gap-1">
                {ex.muscleGroups.map((m) => (
                  <MuscleTag key={m} name={m} />
                ))}
              </div>

              {/* Equipment */}
              {ex.equipment.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ex.equipment.map((eq) => (
                    <span key={eq} className="inline-flex items-center rounded px-2 py-0.5 text-xs bg-zinc-800 text-zinc-400">
                      {eq}
                    </span>
                  ))}
                </div>
              )}

              {/* Target qualities */}
              {ex.targetQuality && ex.targetQuality.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {ex.targetQuality.map((q) => (
                    <span key={q} className="inline-flex items-center rounded-full border border-indigo-700/40 bg-indigo-900/20 px-2 py-0.5 text-xs text-indigo-300">
                      <Star className="mr-1 h-2.5 w-2.5" />
                      {q}
                    </span>
                  ))}
                </div>
              )}

              {/* Expandable science */}
              <button
                onClick={() => setExpanded(expanded === ex.id ? null : ex.id)}
                className="mt-3 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Info className="h-3 w-3" />
                Justification scientifique
                <ChevronRight className={cn("h-3 w-3 transition-transform", expanded === ex.id && "rotate-90")} />
              </button>
              {expanded === ex.id && (
                <div className="mt-2 rounded-lg border border-blue-800/30 bg-blue-950/20 p-3 text-xs text-blue-100 leading-relaxed">
                  {ex.scienceRationale}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── PAP Complexes Tab ────────────────────────────────────────────────────────

function PAPComplexTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const qualityConfig = {
    power: { label: "Puissance", color: "text-blue-400", bg: "bg-blue-900/30", border: "border-blue-700/40" },
    speed: { label: "Vitesse", color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-700/40" },
    reactive_strength: { label: "Force Réactive", color: "text-emerald-400", bg: "bg-emerald-900/30", border: "border-emerald-700/40" },
  };

  return (
    <div className="space-y-6">
      {/* Intro */}
      <Card glass className="border-purple-700/30 bg-purple-950/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-purple-500/10 p-2 mt-0.5">
            <Zap className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Post-Activation Potentiation (PAP)</h3>
            <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
              Le PAP consiste à précéder un exercice explosif d'un exercice lourd qui potentialise le système
              neuromusculaire. La fenêtre d'activation optimale est de <strong className="text-white">3 à 8 minutes</strong>.
              Ce protocole améliore la performance explosive de <strong className="text-white">3 à 8%</strong> chez les athlètes entraînés.
            </p>
          </div>
        </div>
      </Card>

      {/* PAP Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {DEMO_PAP.map((pap) => {
          const cfg = qualityConfig[pap.targetQuality];
          return (
            <Card key={pap.id} glass className={cn("border overflow-hidden", cfg.border)}>
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-white leading-tight">{pap.name}</h3>
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.bg, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>

                {/* Sequence visualization */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">1</div>
                    <div className="flex-1 rounded-lg border border-red-700/30 bg-red-950/20 px-3 py-2">
                      <p className="text-xs font-medium text-red-300">Exercice Lourd</p>
                      <p className="text-sm text-white mt-0.5">{pap.heavy}</p>
                    </div>
                  </div>
                  <div className="ml-3.5 flex items-center gap-2 text-xs text-zinc-500">
                    <Timer className="h-3.5 w-3.5" />
                    <span>{pap.restSeconds / 60} min récupération</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", cfg.bg, cfg.color)}>2</div>
                    <div className={cn("flex-1 rounded-lg border px-3 py-2", cfg.border, cfg.bg)}>
                      <p className={cn("text-xs font-medium", cfg.color)}>Exercice Explosif</p>
                      <p className="text-sm text-white mt-0.5">{pap.explosive}</p>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5" />
                    {pap.sets} séries
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3.5 w-3.5" />
                    ~{Math.round(pap.sets * (pap.restSeconds / 60 + 2))} min total
                  </span>
                </div>

                {/* Science button */}
                <button
                  onClick={() => setExpanded(expanded === pap.id ? null : pap.id)}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  Mécanisme PAP
                  <ChevronRight className={cn("h-3 w-3 transition-transform", expanded === pap.id && "rotate-90")} />
                </button>
                {expanded === pap.id && (
                  <div className="rounded-lg border border-purple-800/30 bg-purple-950/20 p-3 text-xs text-purple-100 leading-relaxed">
                    {pap.science}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* How to program */}
      <Card glass className="p-5">
        <h3 className="mb-3 font-semibold text-white flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" />
          Comment programmer les complexes PAP ?
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
          {[
            { step: "Phase 2–3", desc: "Introduire en Phase 2 (semaine 3-4) quand la base de force est établie.", color: "border-blue-700/30 bg-blue-950/10" },
            { step: "Fréquence", desc: "2 sessions PAP par semaine maximum. Ne pas cumuler avec une séance force maximale.", color: "border-amber-700/30 bg-amber-950/10" },
            { step: "Progression", desc: "Semaine 1 : 2 séries × 2 complexes. Semaine 2+ : 3-4 séries × 2-3 complexes.", color: "border-emerald-700/30 bg-emerald-950/10" },
          ].map((item) => (
            <div key={item.step} className={cn("rounded-lg border p-3", item.color)}>
              <p className="text-xs font-semibold text-zinc-300 mb-1">{item.step}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; description: string }> = [
  { id: "fv", label: "Profil Force-Vitesse", icon: TrendingUp, description: "Droite F-V & recommandations" },
  { id: "exercises", label: "Bibliothèque", icon: BookOpen, description: "Exercices & justifications" },
  { id: "pap", label: "Complexes PAP", icon: Zap, description: "Post-Activation Potentiation" },
];

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<TabId>("fv");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-blue-400" />
            Le Laboratoire
          </h1>
          <p className="mt-1 text-zinc-400">
            Profil Force-Vitesse Morin, bibliothèque d'exercices scientifique & générateur de complexes PAP
          </p>
        </div>
        <Badge variant="info" className="gap-1 text-sm px-3 py-1">
          <Activity className="h-3.5 w-3.5" />
          Phase 3
        </Badge>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-xl bg-zinc-900/60 p-1 border border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "fv" && <FVProfileTab />}
      {activeTab === "exercises" && <ExerciseLibraryTab />}
      {activeTab === "pap" && <PAPComplexTab />}
    </div>
  );
}
