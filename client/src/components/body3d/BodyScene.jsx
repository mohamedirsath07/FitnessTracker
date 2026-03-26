/**
 * BodyScene — Clean R3F Canvas with Studio Lighting
 *
 * Premium rendering stack:
 * ├─ HDRI studio environment (PBR IBL reflections)
 * ├─ 3-point lighting rig (key + fill + rim)
 * ├─ Shadow mapping
 * ├─ Reflective floor
 * ├─ Contact shadows for grounding
 * ├─ Subtle post-processing: Bloom + Vignette
 * ├─ ACES filmic tone mapping
 * └─ Performance: DPR clamping, frustum culling
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Environment,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
  MeshReflectorMaterial,
  Lightformer,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   Reflective Floor — subtle dark mirror surface
   ═══════════════════════════════════════════════ */

function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.001, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={0.85}
        mixStrength={0.4}
        roughness={0.8}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#08080c"
        metalness={0.3}
        mirror={0.3}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════
   Studio Lighting — clean 3-point rig
   ═══════════════════════════════════════════════ */

function StudioLights() {
  return (
    <>
      {/* KEY — warm directional */}
      <directionalLight
        position={[4, 8, 4]}
        intensity={3.0}
        color="#ffeedd"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0001}
        shadow-normalBias={0.03}
      />
      {/* FILL — cool, softer */}
      <directionalLight position={[-5, 5, -3]} intensity={0.7} color="#b0c4ff" />
      {/* RIM — blue backlight for edge definition */}
      <directionalLight position={[0, 4, -7]} intensity={2.2} color="#4488ff" />
      {/* Secondary fill */}
      <directionalLight position={[-3, 2, -4]} intensity={0.6} color="#6677cc" />
      {/* Ambient fill */}
      <ambientLight intensity={0.15} color="#1a2233" />
      {/* Overhead spot */}
      <spotLight
        position={[0, 12, 0]}
        angle={0.35}
        penumbra={1}
        intensity={1.5}
        color="#ffffff"
        castShadow={false}
        decay={2}
      />
      {/* Warm kicker */}
      <pointLight position={[2, 1, -3]} intensity={0.4} color="#ff8844" distance={8} decay={2} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   Post-Processing — subtle refinement only
   ═══════════════════════════════════════════════ */

function PostEffects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.6}
      />
      <Vignette
        offset={0.3}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

/* ═══════════════════════════════════════════════
   Studio Environment with Lightformers
   ═══════════════════════════════════════════════ */

function StudioEnvironment() {
  return (
    <Environment background={false} environmentIntensity={0.7} preset="studio">
      <Lightformer
        position={[4, 5, -3]}
        scale={[6, 3, 1]}
        intensity={1.5}
        color="#ffeedd"
      />
      <Lightformer
        position={[-5, 3, 2]}
        scale={[4, 3, 1]}
        intensity={0.8}
        color="#aabbdd"
      />
      <Lightformer
        position={[0, 8, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[8, 1, 1]}
        intensity={0.6}
        color="#ffffff"
      />
      <Lightformer
        position={[0, -2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
        intensity={0.15}
        color="#0d1520"
      />
    </Environment>
  );
}

/* ═══════════════════════════════════════════════
   Main Scene Component
   ═══════════════════════════════════════════════ */

export default function BodyScene({ children, className = '' }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
          alpha: true,
        }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.5 }}
        flat={false}
      >
        <PerspectiveCamera
          makeDefault
          position={[0.4, 0.2, 3.0]}
          fov={32}
          near={0.1}
          far={50}
        />

        <fog attach="fog" args={['#030306', 6, 18]} />

        <StudioEnvironment />
        <StudioLights />

        <ContactShadows
          position={[0, -1.0, 0]}
          opacity={0.85}
          scale={5}
          blur={2.5}
          far={3}
          color="#000000"
          frames={1}
        />

        <ReflectiveFloor />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={2.0}
          maxDistance={5.5}
          minPolarAngle={Math.PI / 5}
          maxPolarAngle={Math.PI / 1.85}
          autoRotate
          autoRotateSpeed={0.4}
          dampingFactor={0.06}
          enableDamping
          target={[0, 0, 0]}
          rotateSpeed={0.5}
        />

        <PostEffects />

        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
