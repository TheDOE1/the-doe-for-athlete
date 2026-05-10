"use client";

import { FASCIAL_CHAINS } from "@/lib/data/muscles";

// ─── Color Palette — Medical Ecorché Atlas ────────────────────────────────────

const C = {
  skin:             "#c8907a",
  skinEmissive:     "#280e06",
  skinRoughness:    0.72,

  muscle:           "#8b2222",
  muscleEmissive:   "#180404",

  hover:            "#cc3020",
  hoverEmissive:    "#380800",

  selected:         "#ff5535",
  selectedEmissive: "#6a1500",

  chain:            "#e07030",
  chainEmissive:    "#3a1500",

  bone:             "#ece0c8",
  boneEmissive:     "#201808",
};

// ─── Material helpers ─────────────────────────────────────────────────────────

const SkinMat = () => (
  <meshPhysicalMaterial
    color={C.skin}
    emissive={C.skinEmissive}
    emissiveIntensity={1}
    roughness={C.skinRoughness}
    metalness={0}
    clearcoat={0.08}
    clearcoatRoughness={0.92}
  />
);
const BoneMat = () => (
  <meshPhysicalMaterial
    color={C.bone}
    emissive={C.boneEmissive}
    emissiveIntensity={1}
    roughness={0.85}
    metalness={0}
  />
);

// ─── Muscle Mesh ──────────────────────────────────────────────────────────────

type GeoSpec =
  | { type: "sphere";   args: [number, number?, number?] }
  | { type: "capsule";  args: [number, number, number?, number?] }
  | { type: "box";      args: [number, number, number] }
  | { type: "cylinder"; args: [number, number, number, number?] };

type MuscleMeshCfg = {
  muscleId: string;
  side: "right" | "left" | "center";
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  geo: GeoSpec;
};

function MuscleMesh({
  cfg, selected, hovered, inChain, onClick, onHover,
}: {
  cfg: MuscleMeshCfg;
  selected: boolean;
  hovered: boolean;
  inChain: boolean;
  onClick: () => void;
  onHover: (v: boolean) => void;
}) {
  const color =
    selected ? C.selected :
    inChain  ? C.chain    :
    hovered  ? C.hover    : C.muscle;
  const emissive =
    selected ? C.selectedEmissive :
    inChain  ? C.chainEmissive    :
    hovered  ? C.hoverEmissive    : C.muscleEmissive;

  const geo = (() => {
    const g = cfg.geo;
    switch (g.type) {
      case "sphere":
        return <sphereGeometry args={[g.args[0], g.args[1] ?? 14, g.args[2] ?? 10]} />;
      case "capsule":
        return <capsuleGeometry args={[g.args[0], g.args[1], g.args[2] ?? 4, g.args[3] ?? 10]} />;
      case "box":
        return <boxGeometry args={g.args} />;
      case "cylinder":
        return <cylinderGeometry args={[g.args[0], g.args[1], g.args[2], g.args[3] ?? 14]} />;
    }
  })();

  return (
    <mesh
      position={cfg.position}
      rotation={cfg.rotation ?? [0, 0, 0]}
      scale={cfg.scale ?? [1, 1, 1]}
      castShadow
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(true); }}
      onPointerLeave={() => onHover(false)}
    >
      {geo}
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={selected || hovered || inChain ? 1.1 : 0.85}
        roughness={0.78}
        metalness={0}
        clearcoat={0.14}
        clearcoatRoughness={0.88}
      />
    </mesh>
  );
}

// ─── Muscle Configuration ─────────────────────────────────────────────────────

const MUSCLE_MESHES: MuscleMeshCfg[] = [
  // QUADRICEPS
  { muscleId:"quadriceps",  side:"right", position:[ 0.138,-0.375, 0.075], geo:{type:"capsule",args:[0.068,0.46,4,12]}, scale:[0.82,1,0.72] },
  { muscleId:"quadriceps",  side:"left",  position:[-0.138,-0.375, 0.075], geo:{type:"capsule",args:[0.068,0.46,4,12]}, scale:[0.82,1,0.72] },

  // HAMSTRINGS
  { muscleId:"hamstrings",  side:"right", position:[ 0.132,-0.39,-0.073], geo:{type:"capsule",args:[0.062,0.44,4,10]}, scale:[0.78,1,0.7] },
  { muscleId:"hamstrings",  side:"left",  position:[-0.132,-0.39,-0.073], geo:{type:"capsule",args:[0.062,0.44,4,10]}, scale:[0.78,1,0.7] },

  // CALVES (gastrocnemius)
  { muscleId:"calves",      side:"right", position:[ 0.120,-0.80,-0.038], geo:{type:"capsule",args:[0.052,0.28,4,10]}, scale:[0.75,1,0.78] },
  { muscleId:"calves",      side:"left",  position:[-0.120,-0.80,-0.038], geo:{type:"capsule",args:[0.052,0.28,4,10]}, scale:[0.75,1,0.78] },

  // ADDUCTORS
  { muscleId:"adductors",   side:"right", position:[ 0.074,-0.415, 0.025], rotation:[0,0, 0.18], geo:{type:"capsule",args:[0.048,0.38,4,10]}, scale:[0.7,1,0.6] },
  { muscleId:"adductors",   side:"left",  position:[-0.074,-0.415, 0.025], rotation:[0,0,-0.18], geo:{type:"capsule",args:[0.048,0.38,4,10]}, scale:[0.7,1,0.6] },

  // GLUTEUS MAXIMUS
  { muscleId:"glute_max",   side:"right", position:[ 0.130,-0.13,-0.085], geo:{type:"sphere",  args:[0.092,14,10]},    scale:[1.1,0.88,0.82] },
  { muscleId:"glute_max",   side:"left",  position:[-0.130,-0.13,-0.085], geo:{type:"sphere",  args:[0.092,14,10]},    scale:[1.1,0.88,0.82] },

  // GLUTEUS MEDIUS
  { muscleId:"glute_med",   side:"right", position:[ 0.170,-0.07,-0.055], geo:{type:"sphere",  args:[0.058,12,8]},     scale:[0.95,0.8,0.75] },
  { muscleId:"glute_med",   side:"left",  position:[-0.170,-0.07,-0.055], geo:{type:"sphere",  args:[0.058,12,8]},     scale:[0.95,0.8,0.75] },

  // PSOAS
  { muscleId:"psoas",       side:"right", position:[ 0.070,-0.05, 0.044], rotation:[0.3,0, 0.15], geo:{type:"capsule",args:[0.038,0.32,4,8]}, scale:[0.7,1,0.6] },
  { muscleId:"psoas",       side:"left",  position:[-0.070,-0.05, 0.044], rotation:[0.3,0,-0.15], geo:{type:"capsule",args:[0.038,0.32,4,8]}, scale:[0.7,1,0.6] },

  // TFL / IT BAND
  { muscleId:"tfl",         side:"right", position:[ 0.194,-0.25, 0.025], rotation:[0,0, 0.05], geo:{type:"capsule",args:[0.030,0.52,4,8]}, scale:[0.6,1,0.5] },
  { muscleId:"tfl",         side:"left",  position:[-0.194,-0.25, 0.025], rotation:[0,0,-0.05], geo:{type:"capsule",args:[0.030,0.52,4,8]}, scale:[0.6,1,0.5] },

  // RECTUS ABDOMINIS
  { muscleId:"rectus_abdominis", side:"center", position:[0, 0.58, 0.100], geo:{type:"box", args:[0.18,0.42,0.065]} },

  // OBLIQUES
  { muscleId:"obliques",    side:"right", position:[ 0.148, 0.56, 0.055], rotation:[0,0, 0.18], geo:{type:"capsule",args:[0.045,0.34,4,8]}, scale:[0.72,1,0.55] },
  { muscleId:"obliques",    side:"left",  position:[-0.148, 0.56, 0.055], rotation:[0,0,-0.18], geo:{type:"capsule",args:[0.045,0.34,4,8]}, scale:[0.72,1,0.55] },

  // TRANSVERSE ABDOMINIS
  { muscleId:"transverse_abdominis", side:"center", position:[0, 0.55, 0.064], geo:{type:"box", args:[0.28,0.38,0.048]} },

  // PECTORALIS MAJOR ──────────────────────────────────────────────────────────
  { muscleId:"pectoral_major", side:"right", position:[ 0.148, 0.95, 0.090], geo:{type:"sphere", args:[0.108,14,10]}, scale:[1.32,0.72,0.5] },
  { muscleId:"pectoral_major", side:"left",  position:[-0.148, 0.95, 0.090], geo:{type:"sphere", args:[0.108,14,10]}, scale:[1.32,0.72,0.5] },

  // DELTOID ───────────────────────────────────────────────────────────────────
  { muscleId:"deltoid",     side:"right", position:[ 0.268, 1.070, 0], geo:{type:"sphere", args:[0.070,12,10]}, scale:[1.0,0.82,0.95] },
  { muscleId:"deltoid",     side:"left",  position:[-0.268, 1.070, 0], geo:{type:"sphere", args:[0.070,12,10]}, scale:[1.0,0.82,0.95] },

  // TRAPEZIUS ─────────────────────────────────────────────────────────────────
  { muscleId:"trapezius",   side:"right", position:[ 0.105, 1.140,-0.075], rotation:[0.15,0, 0.08], geo:{type:"sphere", args:[0.082,12,8]}, scale:[1.25,0.88,0.52] },
  { muscleId:"trapezius",   side:"left",  position:[-0.105, 1.140,-0.075], rotation:[0.15,0,-0.08], geo:{type:"sphere", args:[0.082,12,8]}, scale:[1.25,0.88,0.52] },

  // LATISSIMUS DORSI ──────────────────────────────────────────────────────────
  { muscleId:"latissimus_dorsi", side:"right", position:[ 0.168, 0.770,-0.075], rotation:[0.08,0, 0.20], geo:{type:"capsule",args:[0.055,0.34,4,10]}, scale:[0.65,1,0.4] },
  { muscleId:"latissimus_dorsi", side:"left",  position:[-0.168, 0.770,-0.075], rotation:[0.08,0,-0.20], geo:{type:"capsule",args:[0.055,0.34,4,10]}, scale:[0.65,1,0.4] },

  // BICEPS BRACHII ────────────────────────────────────────────────────────────
  { muscleId:"biceps",      side:"right", position:[ 0.305, 0.930, 0.022], rotation:[0,0, 0.22], geo:{type:"capsule",args:[0.028,0.175,4,8]} },
  { muscleId:"biceps",      side:"left",  position:[-0.305, 0.930, 0.022], rotation:[0,0,-0.22], geo:{type:"capsule",args:[0.028,0.175,4,8]} },

  // TRICEPS BRACHII ───────────────────────────────────────────────────────────
  { muscleId:"triceps",     side:"right", position:[ 0.310, 0.895,-0.025], rotation:[0,0, 0.22], geo:{type:"capsule",args:[0.032,0.21,4,8]} },
  { muscleId:"triceps",     side:"left",  position:[-0.310, 0.895,-0.025], rotation:[0,0,-0.22], geo:{type:"capsule",args:[0.032,0.21,4,8]} },

  // TIBIALIS ANTERIOR ─────────────────────────────────────────────────────────
  { muscleId:"tibialis_anterior", side:"right", position:[ 0.128,-0.730, 0.048], geo:{type:"capsule",args:[0.031,0.285,4,8]}, scale:[0.72,1,0.6] },
  { muscleId:"tibialis_anterior", side:"left",  position:[-0.128,-0.730, 0.048], geo:{type:"capsule",args:[0.031,0.285,4,8]}, scale:[0.72,1,0.6] },

  // ERECTOR SPINAE ────────────────────────────────────────────────────────────
  { muscleId:"erector_spinae", side:"right", position:[ 0.062, 0.720,-0.060], geo:{type:"capsule",args:[0.034,0.44,4,8]}, scale:[0.8,1,0.65] },
  { muscleId:"erector_spinae", side:"left",  position:[-0.062, 0.720,-0.060], geo:{type:"capsule",args:[0.034,0.44,4,8]}, scale:[0.8,1,0.65] },
];

// ─── Body Base ────────────────────────────────────────────────────────────────

function BodyBase() {
  return (
    <group>
      {/* ── Ghost skin overlay (slightly larger, translucent) ── */}
      <group scale={[1.07, 1.055, 1.07]}>
        <mesh position={[0, 1.50, 0]}>
          <sphereGeometry args={[0.128, 20, 16]} />
          <meshPhysicalMaterial color="#d4a888" roughness={0.68} metalness={0} transparent opacity={0.15} />
        </mesh>
        <mesh position={[0, 1.32, 0]}>
          <cylinderGeometry args={[0.055, 0.068, 0.17, 14]} />
          <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.14} />
        </mesh>
        <mesh position={[0, 0.96, 0]}>
          <cylinderGeometry args={[0.215, 0.188, 0.46, 18]} />
          <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.13} />
        </mesh>
        <mesh position={[0, 0.60, 0]}>
          <cylinderGeometry args={[0.188, 0.168, 0.38, 18]} />
          <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.13} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.168, 0.148, 0.24, 16]} />
          <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.12} />
        </mesh>
        {[1,-1].map((s) => (
          <group key={s}>
            <mesh position={[s * 0.135, -0.36, 0]}>
              <cylinderGeometry args={[0.098, 0.083, 0.56, 16]} />
              <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.12} />
            </mesh>
            <mesh position={[s * 0.124, -0.78, 0]}>
              <cylinderGeometry args={[0.066, 0.048, 0.52, 14]} />
              <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.11} />
            </mesh>
            <mesh position={[s * 0.308, 0.935, 0]} rotation={[0, 0, s * 0.22]}>
              <cylinderGeometry args={[0.047, 0.040, 0.36, 14]} />
              <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.11} />
            </mesh>
            <mesh position={[s * 0.384, 0.660, 0]} rotation={[0, 0, s * 0.32]}>
              <cylinderGeometry args={[0.036, 0.029, 0.30, 12]} />
              <meshPhysicalMaterial color="#c89070" roughness={0.70} metalness={0} transparent opacity={0.10} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── Solid body base ── */}

      {/* Head */}
      <mesh position={[0, 1.50, 0]}><sphereGeometry args={[0.128, 22, 16]} /><SkinMat /></mesh>

      {/* Neck */}
      <mesh position={[0, 1.32, 0]}><cylinderGeometry args={[0.054, 0.066, 0.17, 14]} /><SkinMat /></mesh>

      {/* Clavicle/shoulder caps */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.24, 1.10, 0]}><sphereGeometry args={[0.046, 12, 8]} /><BoneMat /></mesh>
      ))}

      {/* Torso upper */}
      <mesh position={[0, 0.95, 0]}><cylinderGeometry args={[0.208, 0.183, 0.44, 18]} /><SkinMat /></mesh>
      {/* Torso lower */}
      <mesh position={[0, 0.60, 0]}><cylinderGeometry args={[0.183, 0.162, 0.36, 18]} /><SkinMat /></mesh>
      {/* Pelvis */}
      <mesh position={[0, 0.27, 0]}><cylinderGeometry args={[0.162, 0.142, 0.22, 16]} /><SkinMat /></mesh>

      {/* Hip joints */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.158, 0.12, 0]}><sphereGeometry args={[0.042, 12, 8]} /><BoneMat /></mesh>
      ))}

      {/* Thighs */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.130, -0.35, 0]}><cylinderGeometry args={[0.093, 0.078, 0.54, 16]} /><SkinMat /></mesh>
      ))}

      {/* Knee caps */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.128, -0.63, 0.038]}><sphereGeometry args={[0.038, 12, 8]} /><BoneMat /></mesh>
      ))}

      {/* Lower legs */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.120, -0.78, 0]}><cylinderGeometry args={[0.060, 0.044, 0.50, 14]} /><SkinMat /></mesh>
      ))}

      {/* Ankle joints */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.118, -1.07, 0]}><sphereGeometry args={[0.032, 10, 8]} /><BoneMat /></mesh>
      ))}

      {/* Feet */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.112, -1.12, 0.055]}><boxGeometry args={[0.085, 0.040, 0.18]} /><SkinMat /></mesh>
      ))}

      {/* Upper arms */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.302, 0.935, 0]} rotation={[0, 0, s * 0.22]}><cylinderGeometry args={[0.043, 0.037, 0.34, 14]} /><SkinMat /></mesh>
      ))}

      {/* Elbow joints */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.373, 0.740, 0]}><sphereGeometry args={[0.028, 10, 8]} /><BoneMat /></mesh>
      ))}

      {/* Forearms */}
      {[1,-1].map((s) => (
        <mesh key={s} position={[s * 0.380, 0.655, 0]} rotation={[0, 0, s * 0.32]}><cylinderGeometry args={[0.031, 0.025, 0.28, 12]} /><SkinMat /></mesh>
      ))}

      {/* Wrist + hands */}
      {[1,-1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.418, 0.510, 0]}><sphereGeometry args={[0.024, 10, 8]} /><BoneMat /></mesh>
          <mesh position={[s * 0.428, 0.480, 0]}><boxGeometry args={[0.065, 0.044, 0.025]} /><SkinMat /></mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

interface HumanModelProps {
  selectedMuscle: string | null;
  hoveredMuscle: string | null;
  selectedChain: string | null;
  onMuscleClick: (id: string) => void;
  onMuscleHover: (id: string | null) => void;
}

export function HumanModel({
  selectedMuscle,
  hoveredMuscle,
  selectedChain,
  onMuscleClick,
  onMuscleHover,
}: HumanModelProps) {
  const chainMuscles =
    selectedChain
      ? (FASCIAL_CHAINS.find((c) => c.id === selectedChain)?.muscleIds ?? [])
      : [];

  return (
    <group>
      <BodyBase />
      {MUSCLE_MESHES.map((cfg, i) => (
        <MuscleMesh
          key={`${cfg.muscleId}-${cfg.side}-${i}`}
          cfg={cfg}
          selected={selectedMuscle === cfg.muscleId}
          hovered={hoveredMuscle === cfg.muscleId}
          inChain={chainMuscles.includes(cfg.muscleId)}
          onClick={() => onMuscleClick(cfg.muscleId)}
          onHover={(v) => onMuscleHover(v ? cfg.muscleId : null)}
        />
      ))}
    </group>
  );
}
