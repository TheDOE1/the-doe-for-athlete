"use client";

import { useRef, useState } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { useCursor, Line } from "@react-three/drei";
import * as THREE from "three";
import { FASCIAL_CHAINS } from "@/lib/data/muscles";

// ─── Types ────────────────────────────────────────────────────────────────────

type GeoType =
  | { type: "cylinder"; args: [number, number, number, number] }
  | { type: "sphere"; args: [number, number, number] }
  | { type: "box"; args: [number, number, number] }
  | { type: "capsule"; args: [number, number, number, number] };

interface MuscleMeshDef {
  muscleId: string;
  side: "right" | "left" | "center";
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  geo: GeoType;
}

interface BaseBodyDef {
  position: [number, number, number];
  rotation?: [number, number, number];
  geo: GeoType;
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  base: "#0a1628",
  baseEdge: "#162040",
  muscle: "#1a3a8a",
  muscleEmissive: "#081630",
  hover: "#f97316",
  hoverEmissive: "#7a3010",
  selected: "#f59e0b",
  selectedEmissive: "#7a5000",
};

// ─── Base Body Geometry (non-interactive) ─────────────────────────────────────

const BASE_BODY: BaseBodyDef[] = [
  // Head
  { position: [0, 1.42, 0], geo: { type: "sphere", args: [0.12, 16, 12] } },
  // Neck
  {
    position: [0, 1.26, 0],
    geo: { type: "cylinder", args: [0.048, 0.055, 0.14, 8] },
  },
  // Torso upper (chest)
  {
    position: [0, 0.95, 0],
    geo: { type: "box", args: [0.44, 0.46, 0.20] },
  },
  // Torso lower
  {
    position: [0, 0.58, 0],
    geo: { type: "box", args: [0.40, 0.26, 0.17] },
  },
  // Pelvis
  {
    position: [0, 0.34, 0],
    geo: { type: "box", args: [0.38, 0.20, 0.17] },
  },
  // Shoulder caps R/L
  {
    position: [0.26, 1.14, 0],
    geo: { type: "sphere", args: [0.065, 8, 6] },
  },
  {
    position: [-0.26, 1.14, 0],
    geo: { type: "sphere", args: [0.065, 8, 6] },
  },
  // Upper arm R
  {
    position: [0.31, 0.88, 0],
    rotation: [0, 0, 0.22],
    geo: { type: "capsule", args: [0.038, 0.30, 4, 8] },
  },
  // Upper arm L
  {
    position: [-0.31, 0.88, 0],
    rotation: [0, 0, -0.22],
    geo: { type: "capsule", args: [0.038, 0.30, 4, 8] },
  },
  // Lower arm R
  {
    position: [0.36, 0.57, 0],
    rotation: [0, 0, 0.18],
    geo: { type: "capsule", args: [0.028, 0.26, 4, 8] },
  },
  // Lower arm L
  {
    position: [-0.36, 0.57, 0],
    rotation: [0, 0, -0.18],
    geo: { type: "capsule", args: [0.028, 0.26, 4, 8] },
  },
  // Hands R/L
  {
    position: [0.40, 0.40, 0],
    geo: { type: "sphere", args: [0.038, 6, 5] },
  },
  {
    position: [-0.40, 0.40, 0],
    geo: { type: "sphere", args: [0.038, 6, 5] },
  },
  // Knee caps R/L
  {
    position: [0.13, -0.52, 0],
    geo: { type: "sphere", args: [0.055, 8, 6] },
  },
  {
    position: [-0.13, -0.52, 0],
    geo: { type: "sphere", args: [0.055, 8, 6] },
  },
  // Ankle R/L
  {
    position: [0.13, -0.98, 0],
    geo: { type: "sphere", args: [0.04, 8, 6] },
  },
  {
    position: [-0.13, -0.98, 0],
    geo: { type: "sphere", args: [0.04, 8, 6] },
  },
  // Feet R/L
  {
    position: [0.13, -1.04, 0.06],
    geo: { type: "box", args: [0.088, 0.04, 0.18] },
  },
  {
    position: [-0.13, -1.04, 0.06],
    geo: { type: "box", args: [0.088, 0.04, 0.18] },
  },
];

// ─── Muscle Mesh Definitions ──────────────────────────────────────────────────

const MUSCLE_MESHES: MuscleMeshDef[] = [
  // ── Quadriceps (anterior thigh) ──
  {
    muscleId: "quadriceps",
    side: "right",
    position: [0.13, -0.20, 0.065],
    geo: { type: "capsule", args: [0.092, 0.46, 4, 8] },
  },
  {
    muscleId: "quadriceps",
    side: "left",
    position: [-0.13, -0.20, 0.065],
    geo: { type: "capsule", args: [0.092, 0.46, 4, 8] },
  },

  // ── Hamstrings (posterior thigh) ──
  {
    muscleId: "hamstrings",
    side: "right",
    position: [0.13, -0.20, -0.065],
    geo: { type: "capsule", args: [0.084, 0.42, 4, 8] },
  },
  {
    muscleId: "hamstrings",
    side: "left",
    position: [-0.13, -0.20, -0.065],
    geo: { type: "capsule", args: [0.084, 0.42, 4, 8] },
  },

  // ── Adductors (inner thigh) ──
  {
    muscleId: "adductors",
    side: "right",
    position: [0.062, -0.24, 0.01],
    geo: { type: "capsule", args: [0.065, 0.38, 4, 8] },
  },
  {
    muscleId: "adductors",
    side: "left",
    position: [-0.062, -0.24, 0.01],
    geo: { type: "capsule", args: [0.065, 0.38, 4, 8] },
  },

  // ── Grand Fessier (posterior glutes) ──
  {
    muscleId: "glute_max",
    side: "right",
    position: [0.11, 0.20, -0.10],
    geo: { type: "sphere", args: [0.115, 10, 8] },
  },
  {
    muscleId: "glute_max",
    side: "left",
    position: [-0.11, 0.20, -0.10],
    geo: { type: "sphere", args: [0.115, 10, 8] },
  },

  // ── Moyen Fessier (lateral hip) ──
  {
    muscleId: "glute_med",
    side: "right",
    position: [0.22, 0.30, -0.04],
    geo: { type: "sphere", args: [0.080, 8, 6] },
  },
  {
    muscleId: "glute_med",
    side: "left",
    position: [-0.22, 0.30, -0.04],
    geo: { type: "sphere", args: [0.080, 8, 6] },
  },

  // ── Calves (posterior lower leg) ──
  {
    muscleId: "calves",
    side: "right",
    position: [0.13, -0.73, -0.048],
    geo: { type: "capsule", args: [0.068, 0.36, 4, 8] },
  },
  {
    muscleId: "calves",
    side: "left",
    position: [-0.13, -0.73, -0.048],
    geo: { type: "capsule", args: [0.068, 0.36, 4, 8] },
  },

  // ── Psoas (anterior hip / deep) ──
  {
    muscleId: "psoas",
    side: "right",
    position: [0.065, 0.10, 0.068],
    geo: { type: "capsule", args: [0.046, 0.30, 4, 8] },
  },
  {
    muscleId: "psoas",
    side: "left",
    position: [-0.065, 0.10, 0.068],
    geo: { type: "capsule", args: [0.046, 0.30, 4, 8] },
  },

  // ── TFL (tensor fasciae latae — lateral) ──
  {
    muscleId: "tfl",
    side: "right",
    position: [0.22, 0.06, 0.025],
    geo: { type: "capsule", args: [0.038, 0.22, 4, 8] },
  },
  {
    muscleId: "tfl",
    side: "left",
    position: [-0.22, 0.06, 0.025],
    geo: { type: "capsule", args: [0.038, 0.22, 4, 8] },
  },

  // ── Rectus Abdominis (anterior trunk) ──
  {
    muscleId: "rectus_abdominis",
    side: "center",
    position: [0, 0.60, 0.088],
    geo: { type: "box", args: [0.12, 0.28, 0.042] },
  },

  // ── Obliques (lateral trunk) ──
  {
    muscleId: "obliques",
    side: "right",
    position: [0.16, 0.62, 0.072],
    rotation: [0, 0, 0.5],
    geo: { type: "box", args: [0.12, 0.24, 0.038] },
  },
  {
    muscleId: "obliques",
    side: "left",
    position: [-0.16, 0.62, 0.072],
    rotation: [0, 0, -0.5],
    geo: { type: "box", args: [0.12, 0.24, 0.038] },
  },

  // ── Transverse Abdominis (deep — shown as thin wrap) ──
  {
    muscleId: "transverse_abdominis",
    side: "center",
    position: [0, 0.58, 0],
    geo: { type: "box", args: [0.42, 0.22, 0.022] },
  },
];

// ─── Fascial Chain Lines (world-space points) ─────────────────────────────────

const CHAIN_LINE_POINTS: Record<
  string,
  { right: [number, number, number][]; left: [number, number, number][] }
> = {
  SBL: {
    right: [
      [0.13, -1.0, 0.0], // plantar fascia (ankle)
      [0.13, -0.73, -0.05], // calves
      [0.13, -0.20, -0.065], // hamstrings
      [0.11, 0.20, -0.10], // glute max
      [0.0, 0.85, -0.10], // spine extensors (approx)
      [0.0, 1.36, -0.06], // occiput (approx)
    ],
    left: [
      [-0.13, -1.0, 0.0],
      [-0.13, -0.73, -0.05],
      [-0.13, -0.20, -0.065],
      [-0.11, 0.20, -0.10],
      [0.0, 0.85, -0.10],
      [0.0, 1.36, -0.06],
    ],
  },
  SFL: {
    right: [
      [0.13, -1.0, 0.08], // toes / tibialis
      [0.13, -0.20, 0.065], // quads
      [0.06, 0.34, 0.09], // hip flexors
      [0.05, 0.60, 0.09], // rectus abdominis
      [0.04, 0.95, 0.10], // sternum
      [0.0, 1.18, 0.06], // sternomastoïd
    ],
    left: [
      [-0.13, -1.0, 0.08],
      [-0.13, -0.20, 0.065],
      [-0.06, 0.34, 0.09],
      [-0.05, 0.60, 0.09],
      [-0.04, 0.95, 0.10],
      [0.0, 1.18, 0.06],
    ],
  },
  LL: {
    right: [
      [0.13, -1.0, 0.0],
      [0.22, -0.05, 0.02], // TFL
      [0.22, 0.30, -0.04], // glute med
      [0.18, 0.80, 0.0], // obliques lateral
      [0.12, 1.18, 0.0], // SCM
    ],
    left: [
      [-0.13, -1.0, 0.0],
      [-0.22, -0.05, 0.02],
      [-0.22, 0.30, -0.04],
      [-0.18, 0.80, 0.0],
      [-0.12, 1.18, 0.0],
    ],
  },
  DFL: {
    right: [
      [0.13, -1.0, 0.0],
      [0.062, -0.24, 0.01], // adductors
      [0.065, 0.10, 0.068], // psoas
      [0.0, 0.58, 0.0], // transverse / diaphragm
      [0.0, 1.15, 0.0], // deep neck
    ],
    left: [
      [-0.13, -1.0, 0.0],
      [-0.062, -0.24, 0.01],
      [-0.065, 0.10, 0.068],
      [0.0, 0.58, 0.0],
      [0.0, 1.15, 0.0],
    ],
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BasePart({ def }: { def: BaseBodyDef }) {
  return (
    <mesh
      position={def.position}
      rotation={def.rotation ? new THREE.Euler(...def.rotation) : undefined}
    >
      {def.geo.type === "sphere" && (
        <sphereGeometry args={def.geo.args} />
      )}
      {def.geo.type === "cylinder" && (
        <cylinderGeometry args={def.geo.args} />
      )}
      {def.geo.type === "box" && (
        <boxGeometry args={def.geo.args} />
      )}
      {def.geo.type === "capsule" && (
        <capsuleGeometry args={def.geo.args} />
      )}
      <meshStandardMaterial
        color={C.base}
        emissive={C.baseEdge}
        emissiveIntensity={0.3}
        metalness={0.1}
        roughness={0.8}
      />
    </mesh>
  );
}

interface MuscleMeshProps {
  def: MuscleMeshDef;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

function MuscleMesh({
  def,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: MuscleMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [localHovered, setLocalHovered] = useState(false);

  useCursor(localHovered);

  const color = isSelected ? C.selected : isHovered ? C.hover : C.muscle;
  const emissive = isSelected
    ? C.selectedEmissive
    : isHovered
      ? C.hoverEmissive
      : C.muscleEmissive;
  const emissiveIntensity = isSelected ? 1.4 : isHovered ? 1.1 : 0.25;

  // Subtle breathing animation for selected muscle
  useFrame((state) => {
    if (isSelected && meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.015;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setLocalHovered(true);
    onHover(def.muscleId);
  };

  const handlePointerOut = () => {
    setLocalHovered(false);
    onHover(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(def.muscleId);
  };

  return (
    <mesh
      ref={meshRef}
      position={def.position}
      rotation={def.rotation ? new THREE.Euler(...def.rotation) : undefined}
      scale={def.scale ?? [1, 1, 1]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {def.geo.type === "sphere" && (
        <sphereGeometry args={def.geo.args} />
      )}
      {def.geo.type === "cylinder" && (
        <cylinderGeometry args={def.geo.args} />
      )}
      {def.geo.type === "box" && (
        <boxGeometry args={def.geo.args} />
      )}
      {def.geo.type === "capsule" && (
        <capsuleGeometry args={def.geo.args} />
      )}
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        metalness={0.2}
        roughness={0.55}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

// Fascial chain line renderer
function FascialChainLines() {
  return (
    <group>
      {FASCIAL_CHAINS.map((chain) => {
        const points = CHAIN_LINE_POINTS[chain.id];
        if (!points) return null;
        return (
          <group key={chain.id}>
            <Line
              points={points.right as [number, number, number][]}
              color={chain.color}
              lineWidth={1.5}
              transparent
              opacity={0.65}
            />
            <Line
              points={points.left as [number, number, number][]}
              color={chain.color}
              lineWidth={1.5}
              transparent
              opacity={0.65}
            />
          </group>
        );
      })}
    </group>
  );
}

// ─── HumanModel ───────────────────────────────────────────────────────────────

interface HumanModelProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showFascialChains: boolean;
}

export function HumanModel({
  selectedId,
  onSelect,
  showFascialChains,
}: HumanModelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleHover = (id: string | null) => {
    setHoveredId(id);
  };

  const handleSelect = (id: string) => {
    onSelect(selectedId === id ? null : id);
  };

  return (
    <group
      position={[0, -0.2, 0]}
      onClick={(e) => {
        // Deselect when clicking background
        if (e.object.type === "Mesh") return;
        onSelect(null);
      }}
    >
      {/* Base skeleton (non-interactive) */}
      <group>
        {BASE_BODY.map((def, i) => (
          <BasePart key={i} def={def} />
        ))}
      </group>

      {/* Muscle meshes (interactive) */}
      <group>
        {MUSCLE_MESHES.map((def) => (
          <MuscleMesh
            key={`${def.muscleId}-${def.side}`}
            def={def}
            isHovered={hoveredId === def.muscleId}
            isSelected={selectedId === def.muscleId}
            onHover={handleHover}
            onSelect={handleSelect}
          />
        ))}
      </group>

      {/* Fascial chain lines */}
      {showFascialChains && <FascialChainLines />}
    </group>
  );
}
