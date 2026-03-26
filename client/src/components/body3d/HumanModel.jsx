/**
 * HumanModel — Clean 3D body with PBR rendering
 *
 * Model constraints (from GLB analysis):
 *   male_character.glb  → 106KB, 1 mesh, no bones, no morphs, offset at x=6.39
 *   femal_character.glb → 434KB, 1 mesh, no bones, 20 morph targets, scale=100
 *
 * Visual strategy:
 * 1. Auto-center & normalize using bounding box computation
 * 2. Premium MeshPhysicalMaterial with clearcoat, sheen
 * 3. Body fat via non-uniform body scaling
 * 4. Morph targets driven on female model
 * 5. Subtle breathing animation
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════ */

/** Normalize bodyFat 10–30% → 0–1 */
const fatNorm = (bf) => Math.max(0, Math.min(1, (bf - 10) / 20));

/** Premium PBR skin material */
function createSkinMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#c9957a'),
    roughness: 0.6,
    metalness: 0.1,
    clearcoat: 0.12,
    clearcoatRoughness: 0.6,
    sheen: 0.35,
    sheenRoughness: 0.5,
    sheenColor: new THREE.Color('#ffccaa'),
    thickness: 1.2,
    attenuationColor: new THREE.Color('#ff8866'),
    attenuationDistance: 0.5,
    envMapIntensity: 1.6,
    emissive: new THREE.Color('#ff3300'),
    emissiveIntensity: 0,
    flatShading: false,
    side: THREE.FrontSide,
  });
}

/* ═══════════════════════════════════════════════
   Main HumanModel Component
   ═══════════════════════════════════════════════ */

export default function HumanModel({
  gender = 'male',
  bodyFat = 20,
  calorieBurn = 0,
  onLoaded,
}) {
  const groupRef = useRef();
  const modelRef = useRef();
  const meshesRef = useRef([]);
  const morphMeshesRef = useRef([]);
  const materialRef = useRef(null);

  const targetFatRef = useRef(bodyFat);
  const currentFatRef = useRef(bodyFat);
  const breathPhaseRef = useRef(Math.random() * Math.PI * 2);

  const modelPath =
    gender === 'female'
      ? '/models/femal_character.glb'
      : '/models/male_character.glb';

  const gltf = useGLTF(modelPath);

  /* ─── Compute centering layout from bounding box ─── */
  const layout = useMemo(() => {
    if (!gltf.scene) return { scale: 1, position: [0, -1, 0] };

    const clone = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const s = 2 / size.y;

    return {
      scale: s,
      position: [-center.x * s, -box.min.y * s - 1, -center.z * s],
    };
  }, [gltf.scene]);

  /* ─── Apply materials on load ─── */
  useEffect(() => {
    if (!gltf.scene) return;

    materialRef.current = createSkinMaterial();
    const meshes = [];
    const morphMeshes = [];

    gltf.scene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;
      child.frustumCulled = false;

      // Compute smooth vertex normals to eliminate faceted appearance
      if (child.geometry) {
        child.geometry.computeVertexNormals();
      }

      const origMap = child.material?.map;
      const origNormal = child.material?.normalMap;
      const origRoughness = child.material?.roughnessMap;

      const mat = materialRef.current.clone();
      if (origMap) {
        mat.map = origMap;
        mat.map.colorSpace = THREE.SRGBColorSpace;
      }
      if (origNormal) mat.normalMap = origNormal;
      if (origRoughness) mat.roughnessMap = origRoughness;

      child.material = mat;
      meshes.push(child);

      if (child.morphTargetInfluences?.length > 0) {
        morphMeshes.push(child);
      }
    });

    meshesRef.current = meshes;
    morphMeshesRef.current = morphMeshes;

    if (onLoaded) onLoaded();
  }, [gltf.scene, gender, onLoaded]);

  useEffect(() => { targetFatRef.current = bodyFat; }, [bodyFat]);

  // Calorie burn → subtle warmth on model
  useEffect(() => {
    const heat = Math.min(calorieBurn / 500, 1);
    meshesRef.current.forEach((m) => {
      if (m.material) {
        m.material.emissiveIntensity = heat * 0.12;
        m.material.emissive.setHex(
          heat > 0.6 ? 0xff4400 : heat > 0.3 ? 0xff3300 : 0xff2200
        );
      }
    });
  }, [calorieBurn]);

  /* ─── Per-frame animation loop ─── */
  useFrame((state, delta) => {
    if (!groupRef.current || !modelRef.current) return;

    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;

    // Smooth fat interpolation
    const cur = currentFatRef.current;
    const tgt = targetFatRef.current;
    currentFatRef.current = THREE.MathUtils.lerp(cur, tgt, dt * 2.0);
    const fat = fatNorm(currentFatRef.current);

    // Body fat → non-uniform scaling
    const fatXZ = 0.93 + fat * 0.22;
    const fatY = 1.0 - fat * 0.025;
    const s = layout.scale;

    modelRef.current.scale.x = THREE.MathUtils.lerp(modelRef.current.scale.x, s * fatXZ, dt * 3);
    modelRef.current.scale.z = THREE.MathUtils.lerp(modelRef.current.scale.z, s * fatXZ, dt * 3);
    modelRef.current.scale.y = THREE.MathUtils.lerp(modelRef.current.scale.y, s * fatY, dt * 3);

    // Morph targets (female has 20)
    morphMeshesRef.current.forEach((mesh) => {
      if (!mesh.morphTargetInfluences) return;
      for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
        mesh.morphTargetInfluences[i] = THREE.MathUtils.lerp(
          mesh.morphTargetInfluences[i],
          fat * 0.35,
          dt * 2.5
        );
      }
    });

    // Breathing animation
    breathPhaseRef.current += dt * 1.4;
    const breathCycle = Math.sin(breathPhaseRef.current);
    const breathAmplitude = 0.003;

    modelRef.current.scale.y += breathCycle * breathAmplitude;
    modelRef.current.scale.x += breathCycle * breathAmplitude * 0.4;
    modelRef.current.scale.z += breathCycle * breathAmplitude * 0.6;

    // Subtle organic sway
    const sway1 = Math.sin(time * 0.2) * 0.0001;
    const sway2 = Math.sin(time * 0.13 + 1.5) * 0.00005;
    groupRef.current.rotation.y += sway1 + sway2;
  });

  return (
    <group ref={groupRef}>
      <group ref={modelRef} scale={layout.scale} position={layout.position}>
        <primitive object={gltf.scene} dispose={null} />
      </group>
    </group>
  );
}

// Preload both models
useGLTF.preload('/models/male_character.glb');
useGLTF.preload('/models/femal_character.glb');
