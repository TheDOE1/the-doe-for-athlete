/**
 * Preseason Periodization Algorithm
 *
 * References:
 * - Buchheit & Laursen (2013) — HIIT in team sports. Sports Med.
 * - Morin & Samozino (2016) — VBT intensity prescription.
 * - Haff & Triplett (2015) — Essentials of Strength & Conditioning (NSCA).
 * - Impellizzeri et al. (2006) — SSG dimensions in football.
 */

export type PlayerSex = "male" | "female";

export interface PreseasonInput {
  totalWeeks: number;       // 4–8 weeks
  startDate: string;        // ISO date
  playerSex: PlayerSex;
  chronicLoadBaseline: number; // AU (arbitrary units, sRPE baseline)
  hqRatio: number;          // Hamstring:Quad ratio (0.5–0.8 typical)
  weeksOff: number;         // weeks of inactivity before preseason
}

export interface PhaseKeyMetrics {
  vmaPercent: number[];     // target %VMA range for conditioning
  vbtVelocity?: string;     // e.g. "0.6–0.8 m/s"
  ssgDimensions?: string;   // e.g. "30×20m / 4v4"
  targetLoad: number;       // AU target per session
  loadProgression: string;  // description
  domsRisk: number;         // 0–100
}

export interface GeneratedPhase {
  phaseNumber: number;
  name: string;
  weeksStart: number;
  weeksEnd: number;
  focus: string;
  physiologyTarget: string;
  conditioningTarget: string;
  scienceExplanation: string;
  keyMetrics: PhaseKeyMetrics;
  sessionsPerWeek: number;
  keyExercises: string[];
}

export interface GeneratedPreseasonPlan {
  phases: GeneratedPhase[];
  warnings: string[];
  totalWeeks: number;
}

// ─── SSG Dimensions Calculator ───────────────────────────────────────────────

function getSsgDimensions(players: number, phase: "extensive" | "intensive"): string {
  // Based on Casamichana & Castellano (2010): area per player tables
  const areaPerPlayer = phase === "extensive" ? 225 : 150; // m²/player
  const totalArea = areaPerPlayer * players;
  const ratio = 1.5; // length:width ~1.5:1
  const width = Math.round(Math.sqrt(totalArea / ratio));
  const length = Math.round(width * ratio);
  return `${length}×${width}m / ${players}v${players}`;
}

// ─── Phase Generator ──────────────────────────────────────────────────────────

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString().split("T")[0]!;
}

export function generatePreseasonPhases(
  input: PreseasonInput
): GeneratedPreseasonPlan {
  const {
    totalWeeks,
    playerSex,
    chronicLoadBaseline,
    hqRatio,
    weeksOff,
  } = input;

  const warnings: string[] = [];
  const phases: GeneratedPhase[] = [];

  // ── Risk flags ──────────────────────────────────────────────────────────
  if (weeksOff > 6) {
    warnings.push(
      `Arrêt prolongé (${weeksOff} semaines) — Démarrer à 60% de la charge cible et progresser sur 2 semaines.`
    );
  }
  if (hqRatio < 0.6) {
    warnings.push(
      `Ratio H:Q faible (${hqRatio.toFixed(2)}) — Prioriser le renforcement ischio-jambiers en excentrique dès la Phase 1.`
    );
  }
  if (playerSex === "female") {
    warnings.push(
      "Athlètes féminines : risque ACL 3-4× supérieur aux hommes. Intégrer drop-jump tests et neuromuscular training prioritaire."
    );
  }

  // ── Baseline load calculations ──────────────────────────────────────────
  const baseLoad = chronicLoadBaseline * (weeksOff > 4 ? 0.6 : 0.8);
  const sexMultiplier = playerSex === "female" ? 0.88 : 1.0; // females typically lower absolute load

  // ── Phase distribution (adaptive to totalWeeks) ──────────────────────────
  // Always: ~33% phase1, ~34% phase2, ~33% phase3 (rounded to whole weeks)
  const p1Weeks = Math.max(1, Math.round(totalWeeks * 0.33));
  const p3Weeks = Math.max(1, Math.round(totalWeeks * 0.25));
  const p2Weeks = totalWeeks - p1Weeks - p3Weeks;

  // ── Phase 1: Tissue Conditioning + Metabolic Foundation ──────────────────
  const p1Load = Math.round(baseLoad * sexMultiplier * 0.75);
  phases.push({
    phaseNumber: 1,
    name: "Conditionnement Tissulaire",
    weeksStart: 1,
    weeksEnd: p1Weeks,
    focus: "Conditionnement tissulaire + Fondation métabolique",
    physiologyTarget:
      "Restaurer la tolérance tendineuse et musculaire, développer la VO2max aérobie de base (↑capillarisation)",
    conditioningTarget:
      "HIIT long (120% VMA × 2-3min), Excentrique sous-maximal, Course aérobie extensive",
    scienceExplanation:
      "La phase 1 vise la restauration de l'homéostasie tissulaire après la période d'arrêt. Les exercices excentriques sous-maximaux (40-60% 1RM) induisent une adaptation tendineuse progressive (↑collagène type I) sans surcharger le système neuromusculaire. Le HIIT long (répétitions de 2-3 min à 120% VMA) maximise le temps passé à VO2max et stimule les adaptations centrales (↑volume cardiaque). Référence : Buchheit & Laursen, Sports Med 2013.",
    keyMetrics: {
      vmaPercent: [70, 85],
      vbtVelocity: undefined,
      ssgDimensions: getSsgDimensions(4, "extensive"),
      targetLoad: p1Load,
      loadProgression: "+10% par semaine maximum",
      domsRisk: weeksOff > 4 ? 80 : 55,
    },
    sessionsPerWeek: 5,
    keyExercises: [
      "Course aérobie 70-80% FCmax (30 min)",
      "HIIT 120% VMA × 8-10 rép × 2 min / 2 min récup",
      "Nordic Curl excentrique (3×5 rép, sous-maximal)",
      "Squat excentrique lent (3×10, 40% 1RM)",
      "Copenhagen Plank (3×20s par côté)",
      hqRatio < 0.6 ? "Leg Curl isométrique 90° renforcé" : "RDL bilatéral léger",
    ],
  });

  // ── Phase 2: Neural Strength + Aerobic Power ──────────────────────────────
  const p2Load = Math.round(baseLoad * sexMultiplier * 1.05);
  phases.push({
    phaseNumber: 2,
    name: "Force Neurale & Puissance Aérobie",
    weeksStart: p1Weeks + 1,
    weeksEnd: p1Weeks + p2Weeks,
    focus: "Force neurale + Puissance aérobie maximale",
    physiologyTarget:
      "Maximiser le recrutement d'unités motrices rapides, développer la puissance aérobie (↑VMA) et la production de force explosive",
    conditioningTarget:
      "VBT (charge optimale selon profil F-V), SSG haute intensité, Plyométrie progressive",
    scienceExplanation:
      "La phase 2 exploite la supracompensation tissulaire acquise en phase 1 pour développer les qualités neurales. La VBT (Velocity Based Training) permet une prescription de charge objective basée sur la vitesse de barre, assurant 100% d'effort neural sans atteindre l'échec musculaire. Les SSG (Small Sided Games) en surface réduite génèrent des intensités cardiaques ≥85% FCmax avec une spécificité sportive maximale. Référence : Morin & Samozino, Int J Sports Physiol Perform 2016.",
    keyMetrics: {
      vmaPercent: [85, 100],
      vbtVelocity: "0.6–0.8 m/s (force-vitesse optimal)",
      ssgDimensions: getSsgDimensions(3, "intensive"),
      targetLoad: p2Load,
      loadProgression: "Ondulation semaine charge / décharge (ratio 3:1)",
      domsRisk: 40,
    },
    sessionsPerWeek: 5,
    keyExercises: [
      "Squat VBT (charge produisant 0.7 m/s)",
      "Hip Thrust explosif (40-60% 1RM, vitesse max)",
      "SSG 3v3 haute intensité (15m × 10m)",
      "Drop Jump progressif (hauteur +5cm/sem)",
      "Sprint décroissant × 6-8 rép (récup complète)",
      playerSex === "female"
        ? "Neuromuscular training ACL (landing mechanics)"
        : "Sled push 20% BW × 4-6 rép",
    ],
  });

  // ── Phase 3: Sharpening (Affûtage) ───────────────────────────────────────
  const p3Load = Math.round(baseLoad * sexMultiplier * 0.65); // volume -40%, intensité ↑
  phases.push({
    phaseNumber: 3,
    name: "Affûtage",
    weeksStart: p1Weeks + p2Weeks + 1,
    weeksEnd: totalWeeks,
    focus: "Affûtage : intensité maximale + récupération optimisée",
    physiologyTarget:
      "Maintenir les acquis physiologiques, réduire la fatigue résiduelle, optimiser la fraîcheur neuromusculaire pour la compétition",
    conditioningTarget:
      "PAP complexes, RSA (Repeated Sprint Ability), volume -40-60% intensité 100%",
    scienceExplanation:
      "L'affûtage (tapering) exploite la dissociation fatigue/forme : en réduisant le volume de 40 à 60% tout en maintenant l'intensité à 100%, la fatigue diminue plus vite que la forme ne se dégrade. Les complexes PAP (Post-Activation Potentiation) amplifient l'expression de puissance lors des dernières séances. Le RSA (6×40m / 20s récup) valide la capacité à répéter des sprints en match. Référence : Bosquet et al., Med Sci Sports Exerc 2007.",
    keyMetrics: {
      vmaPercent: [95, 110],
      vbtVelocity: "≥1.0 m/s (puissance maximale)",
      ssgDimensions: getSsgDimensions(4, "intensive"),
      targetLoad: p3Load,
      loadProgression: "Volume -40 à -60% / Intensité 100% maintenu",
      domsRisk: 20,
    },
    sessionsPerWeek: 4,
    keyExercises: [
      "Complex PAP : Back Squat 85% × 3 → Box Jump × 5 (4 min repos)",
      "RSA : 6 × 40m sprint / 20s récup passive",
      "Sprints maximaux × 4-6 rép (100% effort, récup complète)",
      "SSG 5v5 match-like (haute intensité, courte durée)",
      "Stretching actif + récup à l'eau fraîche",
    ],
  });

  return {
    phases,
    warnings,
    totalWeeks,
  };
}

// ─── DOMS Risk Calculator ─────────────────────────────────────────────────────

/**
 * Estimates DOMS (Delayed Onset Muscle Soreness) risk for a given week,
 * based on phase, weeks-off, load increase, and prior conditioning.
 * Returns a value 0–100.
 */
export function calculateDomsRisk(
  weekNumber: number,
  phase: GeneratedPhase,
  weeksOff: number,
  previousWeekLoad: number,
  currentWeekLoad: number
): number {
  let risk = phase.keyMetrics.domsRisk;

  // Modulate by actual load spike
  const loadIncrease = previousWeekLoad > 0
    ? ((currentWeekLoad - previousWeekLoad) / previousWeekLoad) * 100
    : 20;

  if (loadIncrease > 20) risk += 15;
  else if (loadIncrease > 10) risk += 7;
  else if (loadIncrease < 0) risk -= 10;

  // First week after long layoff
  if (weekNumber === 1 && weeksOff > 4) risk += 20;

  return Math.max(0, Math.min(100, Math.round(risk)));
}

// ─── VMA % to session description ────────────────────────────────────────────

export function vmaPercentToDescription(vmaLow: number, vmaHigh: number): string {
  if (vmaHigh <= 80) return "Aérobie extensif — conversation possible";
  if (vmaLow >= 100) return "Puissance aérobie maximale — seuil lactate dépassé";
  if (vmaLow >= 90) return "Intensif — proche VO2max";
  return "Aérobie intensif — seuil de confort dépassé";
}
