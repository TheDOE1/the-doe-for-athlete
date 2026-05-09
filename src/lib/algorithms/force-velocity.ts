/**
 * Force-Velocity Profile Algorithm (Morin & Samozino method)
 *
 * References:
 * - Morin & Samozino (2016) — Interpreting Power-Force-Velocity Profiles for
 *   Individualized & Specific Training. Int J Sports Physiol Perform.
 * - Samozino et al. (2012) — A simple method for measuring power, force, velocity
 *   properties, and mechanical effectiveness in sprint running. Scand J Med Sci Sports.
 */

export type FVDeficit = "force" | "velocity" | "balanced";

export interface FVDataPoint {
  velocity: number; // m/s — mean velocity at a given load
  force: number;    // N/kg — mean net horizontal force at a given load
}

export interface FVProfile {
  f0: number;         // N/kg  — theoretical maximal force (x-intercept)
  v0: number;         // m/s   — theoretical maximal velocity (y-intercept)
  pmax: number;       // W/kg  — maximal mechanical power = F0*V0/4
  sfv: number;        // N·s/m/kg — slope of F-V line (negative)
  drf: number;        // %    — decrease in ratio of forces (mechanical effectiveness index)
  optimalLoad: number; // N/kg — load producing Pmax (= F0/2)
  deficit: FVDeficit;
}

export interface FVRecommendations {
  primary: string;
  secondary: string;
  exercises: string[];
  avoidance: string;
}

// ─── Linear Regression ───────────────────────────────────────────────────────

/**
 * Ordinary least-squares linear regression.
 * Returns { slope, intercept } for y = slope * x + intercept
 */
function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);

  const meanX = sumX / n;
  const meanY = sumY / n;

  const slope = (sumXY - n * meanX * meanY) / (sumX2 - n * meanX * meanX);
  const intercept = meanY - slope * meanX;

  // R²
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0);
  const ssRes = points.reduce(
    (s, p) => s + (p.y - (slope * p.x + intercept)) ** 2,
    0
  );
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1;

  return { slope, intercept, r2 };
}

// ─── Core FV Calculation ─────────────────────────────────────────────────────

/**
 * Compute the Force-Velocity profile from paired (velocity, force) data.
 *
 * Minimum 2 data points required. Typical use case: 4-6 loaded sprint
 * conditions (unloaded + sled loads of +10 to +80% body mass) or
 * isoinertial VBT sets at different velocities.
 */
export function computeFVProfile(data: FVDataPoint[]): FVProfile {
  if (data.length < 2) {
    throw new Error("At least 2 data points are required to compute an FV profile.");
  }

  // Regression: F = SFV * V + F0  →  F on y-axis, V on x-axis
  const points = data.map((d) => ({ x: d.velocity, y: d.force }));
  const { slope, intercept } = linearRegression(points);

  // F0 = y-intercept (force at zero velocity)
  const f0 = Math.max(intercept, 0.001);

  // V0 = x-intercept (velocity at zero force) = -F0 / slope
  const v0 = slope < 0 ? -intercept / slope : 0.001;

  // Pmax = F0 * V0 / 4  (peak of the power-velocity parabola)
  const pmax = (f0 * v0) / 4;

  // SFV = slope (N·s/m/kg) — always negative in a correct profile
  const sfv = slope;

  // Theoretical SFVopt (optimal slope for a balanced profile)
  // Samozino et al.: SFVopt ≈ -F0/V0 * (performance index correction)
  // Simplified: sfvOpt = -F0/V0
  const sfvOpt = f0 > 0 && v0 > 0 ? -f0 / v0 : -1;

  // DRF = decrease in ratio of forces (Morin 2011)
  // For sprint data: DRF = SFV / SFVopt   (dimensionless ratio of actual vs optimal slope)
  // Here we approximate using normalised slope deviation
  const drf = sfvOpt !== 0 ? Math.abs(sfv / sfvOpt) * 100 : 100;

  // Optimal load for Pmax = F0 / 2
  const optimalLoad = f0 / 2;

  // Deficit classification
  const sfvRatio = sfv / sfvOpt; // should be ~1 for balanced
  let deficit: FVDeficit;
  if (sfvRatio < 0.8) {
    // Too steep (too much force, not enough velocity)
    deficit = "force";
  } else if (sfvRatio > 1.25) {
    // Too flat (too much velocity, not enough force)
    deficit = "velocity";
  } else {
    deficit = "balanced";
  }

  return {
    f0: round2(f0),
    v0: round2(v0),
    pmax: round2(pmax),
    sfv: round2(sfv),
    drf: round2(drf),
    optimalLoad: round2(optimalLoad),
    deficit,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Power Curve Generation ──────────────────────────────────────────────────

export interface FVChartPoint {
  velocity: number;
  force: number;
  power: number;
}

/**
 * Generate points for the F-V line and P-V parabola (for charting).
 * Returns an array of { velocity, force, power } across the full 0→V0 range.
 */
export function generateFVCurvePoints(
  profile: FVProfile,
  steps = 50
): FVChartPoint[] {
  const points: FVChartPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const v = (profile.v0 * i) / steps;
    const f = Math.max(0, profile.f0 + profile.sfv * v);
    const p = f * v;
    points.push({
      velocity: round2(v),
      force: round2(f),
      power: round2(p),
    });
  }
  return points;
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export function getFVRecommendations(profile: FVProfile): FVRecommendations {
  switch (profile.deficit) {
    case "force":
      return {
        primary: "Déficit de FORCE — Le profil indique un manque de capacités de force maximale.",
        secondary:
          "Prioriser les exercices lourds (≥85% 1RM), les ischiaux en excentrique, le squat profond et les tractions à charge.",
        exercises: [
          "Squat arrière lourd (85–95% 1RM)",
          "Hip Thrust (90% 1RM)",
          "Nordic Curl excentrique",
          "Leg Press chargé",
          "Deadlift roumain",
        ],
        avoidance: "Éviter de sur-prioriser les exercices balistiques légers avant correction du déficit.",
      };
    case "velocity":
      return {
        primary: "Déficit de VITESSE — Le profil révèle un manque de capacités de vitesse-puissance.",
        secondary:
          "Prioriser les exercices explosifs légers (≤30% 1RM), les sauts, les sprints libres et les exercices balistiques.",
        exercises: [
          "Sprint décroissant libre",
          "Squat jump (0–30% 1RM)",
          "Drop Jump réactif",
          "Box Jump maximal",
          "Medicine Ball Throw",
        ],
        avoidance: "Éviter d'augmenter encore la charge lourde sans développer la composante vitesse.",
      };
    default:
      return {
        primary: "Profil ÉQUILIBRÉ — Excellent rapport force-vitesse.",
        secondary:
          "Maintenir l'équilibre en alternant blocs de force (≥80% 1RM) et blocs explosifs (≤40% 1RM). Développer la puissance maximale.",
        exercises: [
          "Complex training (Force + Explosif)",
          "Squat sauté (40–60% 1RM)",
          "Sprint avec sled léger",
          "Olympic lifts (Clean, Snatch)",
          "Depth Jump",
        ],
        avoidance: "Ne pas déséquilibrer le profil en sur-spécialisant force pure ou vitesse pure.",
      };
  }
}

// ─── Demo Data Generator ──────────────────────────────────────────────────────

/**
 * Generate realistic F-V data from sprint test (Morin 2010).
 * Returns typical values for an elite footballer.
 */
export function generateDemoFVProfile(
  deficit: FVDeficit = "balanced"
): { data: FVDataPoint[]; profile: FVProfile } {
  // Base values for a balanced elite footballer
  const baseF0 = 9.5;  // N/kg
  const baseV0 = 9.8;  // m/s

  let f0Mult = 1;
  let v0Mult = 1;

  if (deficit === "force") {
    f0Mult = 0.78; // lower force
    v0Mult = 1.0;
  } else if (deficit === "velocity") {
    f0Mult = 1.0;
    v0Mult = 0.75; // lower velocity
  }

  const f0 = baseF0 * f0Mult;
  const v0 = baseV0 * v0Mult;
  const sfv = -f0 / v0;

  // Simulate 5 measurement points (sled loads)
  const data: FVDataPoint[] = [0, 0.1, 0.2, 0.4, 0.6].map((loadFraction) => {
    const v = v0 * (1 - loadFraction) * (0.95 + Math.random() * 0.1);
    const f = f0 + sfv * v + (Math.random() - 0.5) * 0.3;
    return { velocity: round2(Math.max(0.1, v)), force: round2(Math.max(0.5, f)) };
  });

  const profile = computeFVProfile(data);
  return { data, profile };
}
