"use client";

import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { HumanModel } from "./HumanModel";

// ─── Camera rig ───────────────────────────────────────────────────────────────

type ViewType = "anterior" | "posterior" | "lateral_r" | "lateral_l";

const VIEW_POSITIONS: Record<ViewType, [number, number, number]> = {
  anterior: [0, 0.2, 4.2],
  posterior: [0, 0.2, -4.2],
  lateral_r: [4.2, 0.2, 0],
  lateral_l: [-4.2, 0.2, 0],
};

// ─── Scene Interior (must be inside Canvas) ───────────────────────────────────

interface SceneInteriorProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showFascialChains: boolean;
  view: ViewType;
}

function SceneInterior({
  selectedId,
  onSelect,
  showFascialChains,
  view,
}: SceneInteriorProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

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
      {/* Lights */}
      <ambientLight intensity={0.25} color="#4488ff" />
      {/* Main key light */}
      <directionalLight
        position={[3, 8, 5]}
        intensity={1.0}
        color="#c8d8ff"
        castShadow={false}
      />
      {/* Fill light */}
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.35}
        color="#2030a0"
      />
      {/* Rim / back light */}
      <directionalLight
        position={[0, -3, -5]}
        intensity={0.25}
        color="#4060c0"
      />
      {/* Top neon point */}
      <pointLight position={[0, 4, 1]} intensity={0.5} color="#60aaff" />
      {/* Bottom glow */}
      <pointLight position={[0, -2, 0]} intensity={0.2} color="#002060" />

      {/* Human body model */}
      <HumanModel
        selectedId={selectedId}
        onSelect={onSelect}
        showFascialChains={showFascialChains}
      />

      {/* Floor glow disc */}
      <mesh position={[0, -1.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 32]} />
        <meshBasicMaterial
          color="#1a3aff"
          transparent
          opacity={0.08}
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

// ─── AnatomyScene ─────────────────────────────────────────────────────────────

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
        toneMappingExposure: 1.1,
      }}
      style={{ background: "#030712" }}
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
