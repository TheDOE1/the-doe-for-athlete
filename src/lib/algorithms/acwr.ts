/**
 * ACWR (Acute:Chronic Workload Ratio) Algorithm
 * Using EWMA (Exponentially Weighted Moving Average) method
 *
 * Reference: Williams et al. (2017) - EWMA provides better sensitivity
 * than rolling averages for detecting injury risk spikes.
 */

export type ACWRZone = "green" | "orange" | "red";

export interface ACWRResult {
  acuteLoad: number;
  chronicLoad: number;
  ratio: number;
  zone: ACWRZone;
}

export interface DailyLoad {
  date: string; // ISO date
  load: number; // sRPE or total load units
}

// ─── EWMA Constants ──────────────────────────────────────────────────────────

const ACUTE_PERIOD = 7; // days
const CHRONIC_PERIOD = 28; // days

// Decay factors: lambda = 2 / (N + 1)
const LAMBDA_ACUTE = 2 / (ACUTE_PERIOD + 1);
const LAMBDA_CHRONIC = 2 / (CHRONIC_PERIOD + 1);

// ─── Zone Classification ─────────────────────────────────────────────────────

export function classifyZone(ratio: number): ACWRZone {
  if (ratio > 1.5) return "red";
  if (ratio > 1.3) return "orange";
  // < 0.8 = undertrained but still green in terms of risk management
  return "green";
}

export function getZoneLabel(zone: ACWRZone): string {
  switch (zone) {
    case "green":
      return "Zone optimale";
    case "orange":
      return "Attention requise";
    case "red":
      return "Danger — Réduire volume";
  }
}

export function getZoneRecommendation(ratio: number): string {
  if (ratio > 1.5) {
    const reduction = Math.round((1 - 1.0 / ratio) * 100);
    return `Réduire le volume d'entraînement de ~${reduction}% (recommandé -30% minimum). Risque de blessure élevé.`;
  }
  if (ratio > 1.3) {
    return "Surveiller la charge. Éviter les pics d'intensité. Favoriser les séances de récupération active.";
  }
  if (ratio < 0.8) {
    return "Joueur sous-entraîné. Augmenter progressivement la charge (+10% par semaine max).";
  }
  return "Charge optimale. Maintenir la progression actuelle.";
}

// ─── EWMA Calculation ────────────────────────────────────────────────────────

/**
 * Calculate EWMA for a series of daily loads.
 * EWMA_today = Load_today * lambda + (1 - lambda) * EWMA_yesterday
 */
export function calculateEWMA(loads: number[], lambda: number): number {
  if (loads.length === 0) return 0;

  let ewma = loads[0]!;
  for (let i = 1; i < loads.length; i++) {
    ewma = loads[i]! * lambda + (1 - lambda) * ewma;
  }
  return ewma;
}

/**
 * Calculate ACWR for a player given their daily load history.
 * Requires at least 28 days of data for meaningful results.
 * If less data available, will calculate with available data.
 */
export function calculateACWR(dailyLoads: DailyLoad[]): ACWRResult {
  if (dailyLoads.length === 0) {
    return { acuteLoad: 0, chronicLoad: 0, ratio: 0, zone: "green" };
  }

  // Sort by date ascending
  const sorted = [...dailyLoads].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const loads = sorted.map((d) => d.load);

  // Calculate EWMA for acute (7-day) and chronic (28-day)
  const acuteLoad = calculateEWMA(loads, LAMBDA_ACUTE);
  const chronicLoad = calculateEWMA(loads, LAMBDA_CHRONIC);

  // Avoid division by zero
  const ratio = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;
  const zone = classifyZone(ratio);

  return {
    acuteLoad: Math.round(acuteLoad * 100) / 100,
    chronicLoad: Math.round(chronicLoad * 100) / 100,
    ratio: Math.round(ratio * 100) / 100,
    zone,
  };
}

/**
 * Calculate ACWR history over time (for charting).
 * Returns an ACWR result for each day from startIndex onwards.
 */
export function calculateACWRHistory(
  dailyLoads: DailyLoad[],
  startFromDay: number = CHRONIC_PERIOD
): Array<{ date: string } & ACWRResult> {
  if (dailyLoads.length === 0) return [];

  const sorted = [...dailyLoads].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const results: Array<{ date: string } & ACWRResult> = [];
  const startIdx = Math.min(startFromDay, sorted.length - 1);

  for (let i = startIdx; i < sorted.length; i++) {
    const subset = sorted.slice(0, i + 1);
    const acwr = calculateACWR(subset);
    results.push({ date: sorted[i]!.date, ...acwr });
  }

  return results;
}

/**
 * Recalculate ACWR for a specific player given their load data.
 * Returns the latest ACWR + full history for charting.
 */
export function recalculatePlayerACWR(playerLoads: DailyLoad[]): {
  current: ACWRResult;
  history: Array<{ date: string } & ACWRResult>;
} {
  const current = calculateACWR(playerLoads);
  const history = calculateACWRHistory(playerLoads);

  return { current, history };
}

/**
 * Fill missing days with 0 load (rest days).
 * Important for accurate EWMA calculation.
 */
export function fillMissingDays(loads: DailyLoad[]): DailyLoad[] {
  if (loads.length === 0) return [];

  const sorted = [...loads].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filled: DailyLoad[] = [];
  const start = new Date(sorted[0]!.date);
  const end = new Date(sorted[sorted.length - 1]!.date);

  const loadMap = new Map(sorted.map((l) => [l.date, l.load]));

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0]!;
    filled.push({
      date: dateStr,
      load: loadMap.get(dateStr) ?? 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return filled;
}
