"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { HumanModel } from "./HumanModel";
import { getMuscleById } from "@/lib/data/muscles";

// ─── Camera views ─────────────────────────────────────────────────────────────

type ViewType = "anterior" | "posterior" | "lateral_r" | "lateral_l";

const VIEW_POSITIONS: Record<ViewType, [number, number, number]> = {
  anterior:  [ 0,   0.2,  4.2],
  posterior: [ 0,   0.2, -4.2],
  lateral_r: [ 4.2, 0.2,  0  ],
  lateral_l: [-4.2, 0.2,  0  ],
};

// ─── Scene interior ───────────────────────────────────────────────────────────

interface SceneInteriorProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showFascialChains: boolean;
  view: ViewType;
}

function SceneInterior({ selectedId, onSelect, showFascialChains, view }: SceneInteriorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Derive selected fascial chain from the selected muscle
  const selectedChain = showFascialChains && selectedId
    ? (getMuscleById(selectedId)?.myofascialLineId ?? null)
    : null;

  useEffect(() => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const pos = VIEW_POSITIONS[view];
    ctrl.object.position.set(...pos);
    ctrl.target.set(0, 0.2, 0);
    ctrl.update();
  }, [view]);

  return (
    <>
      {/* ── Warm Medical Clinical Lighting ── */}

      {/* Soft global fill */}
      <ambientLight intensity={0.32} color="#fff0e8" />

      {/* Key light — warm top-front */}
      <directionalLight
        position={[2, 9, 5]}
        intensity={1.15}
        color="#fff8f0"
        castShadow={false}
      />

      {/* Warm side fill */}
      <directionalLight
        position={[-4, 3, 3]}
        intensity={0.55}
        color="#ffe8d0"
      />

      {/* Warm rim / back light */}
      <directionalLight
        position={[0.5, -2, -5]}
        intensity={0.28}
        color="#ff9060"
      />

      {/* Top anatomy lamp */}
      <pointLight position={[0, 5, 1.5]} intensity={0.45} color="#fff5e8" />

      {/* Ground bounce — warm red-orange */}
      <pointLight position={[0, -1.8, 0]} intensity={0.18} color="#ff5020" decay={2} />

      {/* ── Human body model ── */}
      <HumanModel
        selectedMuscle={selectedId}
        hoveredMuscle={hoveredMuscle}
        selectedChain={selectedChain}
        onMuscleClick={(id) => onSelect(id === selectedId ? null : id)}
        onMuscleHover={setHoveredMuscle}
      />

      {/* ── Floor disc — warm glow ── */}
      <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 32]} />
        <meshBasicMaterial
          color="#cc4010"
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>

      {/* Orbit controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        minDistance={2.2}
        maxDistance={7}
        target={[0, 0.2, 0]}
        enableDamping
        dampingFactor={0.08}
        makeDefault
      />
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

interface AnatomySceneProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showFascialChains: boolean;
  view: ViewType;
  className?: string;
}

export default function AnatomyScene({
  selectedId,
  onSelect,
  showFascialChains,
  view,
  className,
}: AnatomySceneProps) {
  return (
    <Canvas
      className={className}
      camera={{
        position: VIEW_POSITIONS.anterior,
        fov: 42,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ background: "#0a0604" }}
    >
      <SceneInterior
        selectedId={selectedId}
        onSelect={onSelect}
        showFascialChains={showFascialChains}
        view={view}
      />
    </Canvas>
  );
}
