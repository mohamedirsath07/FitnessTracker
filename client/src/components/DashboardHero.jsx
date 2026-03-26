/**
 * DashboardHero — Lightweight inline 3D body model
 *
 * Optimized for side-by-side dashboard layout:
 * - Minimal scene: Environment preset + ContactShadows only
 * - No post-processing, no floor reflections, no orbit controls
 * - DPR clamped [1, 1.5], frameloop demand after idle
 * - Transparent alpha canvas, blends with page bg
 * - MeshStandardMaterial for mid-range GPU compat
 */

import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Apply PBR material — keeps original textures ─── */
function applyMaterial(child) {
  if (!child.isMesh) return;
  child.castShadow = true;
  child.receiveShadow = false;
  child.frustumCulled = true;

  if (child.material) {
    child.material.envMapIntensity = 0.85;
    child.material.needsUpdate = true;
  }
}

/* ─── Adaptive performance — halve resolution on slow frames ─── */
function AdaptivePerf() {
  const { gl } = useThree();
  const frameRef = useRef(0);
  useFrame((_, delta) => {
    frameRef.current++;
    // After 120 frames, if avg delta > 20ms, drop pixel ratio
    if (frameRef.current === 120) {
      if (delta > 0.02) gl.setPixelRatio(1);
    }
  });
  return null;
}

/* ─── Model with breathing only ─── */
function DashboardModel() {
  const groupRef = useRef();
  const modelRef = useRef();
  const breathRef = useRef(Math.random() * Math.PI * 2);

  const gltf = useGLTF('/models/human_body.glb');

  const layout = useMemo(() => {
    if (!gltf.scene) return { scale: 1, position: [0, -1.4, 0] };
    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = 2.4 / size.y; // slightly taller presence
    return {
      scale: s,
      position: [-center.x * s, -box.min.y * s - 1.4, -center.z * s],
    };
  }, [gltf.scene]);

  useEffect(() => {
    if (!gltf.scene) return;
    gltf.scene.traverse(applyMaterial);
  }, [gltf.scene]);

  useFrame((_, delta) => {
    if (!groupRef.current || !modelRef.current) return;
    const dt = Math.min(delta, 0.05);

    // Very slow auto-rotate
    groupRef.current.rotation.y += dt * 0.1;

    // Breathing — barely perceptible
    breathRef.current += dt * 0.9;
    const breath = Math.sin(breathRef.current) * 0.0015;
    const s = layout.scale;
    modelRef.current.scale.set(s + breath * 0.25, s + breath, s + breath * 0.3);
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} scale={layout.scale} position={layout.position}>
        <primitive object={gltf.scene} dispose={null} />
      </group>
    </group>
  );
}

/* ─── Exported component ─── */
export default function DashboardHero() {
  return (
    <div className="w-full h-full min-h-[240px]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.6, 3.8], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.5 }}
      >
        <Environment preset="studio" />
        <AdaptivePerf />

        {/* Key — warm, soft shadow */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.6}
          color="#faf0e6"
          castShadow
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0004}
        />
        {/* Fill — cool, no shadow */}
        <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#c0d0f0" />
        {/* Ambient base */}
        <ambientLight intensity={0.08} />

        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.25}
          blur={2.5}
          scale={3}
          far={2}
          frames={1}
        />

        <Suspense fallback={null}>
          <DashboardModel />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/models/human_body.glb');
