/**
 * 3D BODY VISUALIZER - Enhanced with Body Fat Visualization
 * Loads male or female 3D character model based on user gender
 * Dynamically adjusts body proportions based on body fat percentage
 * Shows visual indicators for body fat levels
 */

import React, { useRef, Suspense, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Html, Center } from '@react-three/drei';
import * as THREE from 'three';

// Preload models for faster loading
useGLTF.preload('/models/male_character.glb');
useGLTF.preload('/models/femal_character.glb');

// Body fat color gradient - from lean (cyan) to high (red)
const getBodyFatColor = (bodyFat, gender = 'male') => {
    // Different ideal ranges for male/female
    const leanThreshold = gender === 'female' ? 18 : 12;
    const avgThreshold = gender === 'female' ? 25 : 20;
    const highThreshold = gender === 'female' ? 32 : 28;

    if (bodyFat <= leanThreshold) {
        // Lean: Cyan to Blue
        return new THREE.Color('#00d4ff');
    } else if (bodyFat <= avgThreshold) {
        // Athletic/Average: Blue to Green
        const t = (bodyFat - leanThreshold) / (avgThreshold - leanThreshold);
        return new THREE.Color().lerpColors(
            new THREE.Color('#00d4ff'),
            new THREE.Color('#22c55e'),
            t
        );
    } else if (bodyFat <= highThreshold) {
        // Above average: Green to Orange
        const t = (bodyFat - avgThreshold) / (highThreshold - avgThreshold);
        return new THREE.Color().lerpColors(
            new THREE.Color('#22c55e'),
            new THREE.Color('#f97316'),
            t
        );
    } else {
        // High: Orange to Red
        const t = Math.min((bodyFat - highThreshold) / 10, 1);
        return new THREE.Color().lerpColors(
            new THREE.Color('#f97316'),
            new THREE.Color('#ef4444'),
            t
        );
    }
};

// Get body fat category text
const getBodyFatCategory = (bodyFat, gender = 'male') => {
    const ranges = gender === 'female' ? {
        essential: 12, athletes: 18, fitness: 25, average: 32
    } : {
        essential: 5, athletes: 12, fitness: 18, average: 25
    };

    if (bodyFat <= ranges.essential) return { label: 'Essential', color: 'text-cyan-400' };
    if (bodyFat <= ranges.athletes) return { label: 'Athletic', color: 'text-blue-400' };
    if (bodyFat <= ranges.fitness) return { label: 'Fitness', color: 'text-green-400' };
    if (bodyFat <= ranges.average) return { label: 'Average', color: 'text-amber-400' };
    return { label: 'Above Average', color: 'text-red-400' };
};

function HumanModel({ gender = 'male', weight = 70, bodyFat = 20, height = 170, showIndicator = true }) {
    const groupRef = useRef();
    const materialRef = useRef();

    // Load the appropriate model based on gender
    const modelPath = gender === 'female'
        ? '/models/femal_character.glb'
        : '/models/male_character.glb';

    const { scene } = useGLTF(modelPath);

    // Get body fat color
    const bodyColor = useMemo(() => getBodyFatColor(bodyFat, gender), [bodyFat, gender]);
    
    // Base skin tone that shifts based on body fat
    const skinColor = useMemo(() => {
        const baseSkin = new THREE.Color('#c9956c');
        // Blend with body fat indicator color subtly
        return baseSkin.lerp(bodyColor, 0.15);
    }, [bodyColor]);

    // Clone the scene to avoid issues with reusing the same geometry
    const clonedScene = useMemo(() => {
        const clone = scene.clone();

        // Apply skin-like material to the model with body fat color influence
        clone.traverse((child) => {
            if (child.isMesh) {
                // Create realistic skin material with double-sided rendering
                child.material = new THREE.MeshPhysicalMaterial({
                    color: skinColor,
                    roughness: 0.55,
                    metalness: 0,
                    clearcoat: 0.05,
                    sheen: 0.2,
                    sheenColor: new THREE.Color('#ffe4cc'),
                    side: THREE.DoubleSide,
                    emissive: bodyColor,
                    emissiveIntensity: 0.05, // Subtle glow based on body fat
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        return clone;
    }, [scene, skinColor, bodyColor]);

    // Calculate scale based on height, weight, and body fat
    // Enhanced scaling for more dramatic visual differences
    const { scaleX, scaleY, scaleZ } = useMemo(() => {
        // Height affects vertical scale (base 170cm = 1.0)
        const heightScale = height / 170;

        // BMI-inspired weight scaling for more realistic proportions
        // Base weight 70kg = 1.0, ranges from ~0.75 (50kg) to ~1.35 (100kg)
        const weightFactor = Math.pow(weight / 70, 0.6);

        // Body fat affects width/depth significantly more
        // Enhanced exponential curve for very dramatic effect at higher body fat
        const fatNormalized = (bodyFat - 15) / 20;
        const fatScale = 1 + fatNormalized * 0.45; // More dramatic: 0.88 (8%) to 1.45 (40%)

        // Additional belly/torso emphasis for higher body fat
        const bellyFactor = bodyFat > 20 ? 1 + ((bodyFat - 20) / 25) * 0.2 : 1;

        // Slimming effect for very low body fat
        const leanFactor = bodyFat < 15 ? 0.95 + (bodyFat / 150) : 1;

        // Base scale factor
        const baseScale = 0.9;

        return {
            scaleX: baseScale * weightFactor * fatScale * bellyFactor * leanFactor,
            scaleY: baseScale * heightScale,
            scaleZ: baseScale * weightFactor * fatScale * bellyFactor * leanFactor * 0.95,
        };
    }, [height, weight, bodyFat]);

    // Gentle rotation animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.35;
        }
    });

    return (
        <group ref={groupRef}>
            <Center>
                <primitive
                    object={clonedScene}
                    scale={[scaleX, scaleY, scaleZ]}
                    position={[0, -1, 0]}
                />
            </Center>
        </group>
    );
}

function ScanLine() {
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 1.2;
            ref.current.material.opacity = 0.35 - Math.abs(ref.current.position.y) * 0.15;
        }
    });

    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2, 0.008]} />
            <meshBasicMaterial color="#00ddff" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
    );
}

function LoadingFallback() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-cyan-400 text-xs">Loading Model...</div>
            </div>
        </Html>
    );
}

function ErrorFallback({ error }) {
    return (
        <Html center>
            <div className="text-red-400 text-xs text-center max-w-[200px]">
                Failed to load 3D model.<br />
                <span className="text-zinc-500">{error?.message || 'Unknown error'}</span>
            </div>
        </Html>
    );
}

// Error boundary component
class ModelErrorBoundary extends React.Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}

export default function BodyVisualizer({ weight = 70, bodyFat = 20, gender = 'male', height = 170, compact = false }) {
    const category = getBodyFatCategory(bodyFat, gender);
    
    return (
        <div className={`relative w-full h-full ${compact ? 'min-h-[280px]' : 'min-h-[400px]'} bg-gradient-to-b from-zinc-900 via-zinc-900 to-black rounded-xl overflow-hidden`}>
            {/* Body Fat Category Badge */}
            {!compact && (
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-black/60 backdrop-blur px-2.5 py-1 rounded text-[9px] tracking-widest uppercase text-zinc-400">
                        3D Body Scan
                    </div>
                    <div className={`mt-1.5 bg-black/70 backdrop-blur px-2.5 py-1.5 rounded text-[10px] font-semibold ${category.color} border-l-2`} 
                         style={{ borderColor: 'currentColor' }}>
                        {category.label}
                    </div>
                </div>
            )}

            {/* Stats Overlay */}
            <div className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3'} z-10 flex flex-col gap-1.5`}>
                {!compact && (
                    <>
                        <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                            HEIGHT: {height}cm
                        </div>
                        <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                            WEIGHT: {weight}kg
                        </div>
                    </>
                )}
                <div className={`bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono border-l-2 ${category.color}`}
                     style={{ borderColor: 'currentColor' }}>
                    BODY FAT: {bodyFat}%
                </div>
            </div>

            {/* Body Fat Scale Indicator */}
            {!compact && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[8px] text-zinc-500 -rotate-90 whitespace-nowrap mb-8">FAT %</div>
                        <div className="w-2 h-32 rounded-full bg-gradient-to-b from-cyan-400 via-green-400 via-amber-400 to-red-400 relative">
                            {/* Current position indicator */}
                            <div 
                                className="absolute -left-1 w-4 h-1 bg-white rounded-full shadow-lg shadow-white/50 transition-all duration-500"
                                style={{ 
                                    top: `${Math.min(Math.max((bodyFat - 5) / 40 * 100, 0), 100)}%`,
                                    transform: 'translateY(-50%)'
                                }}
                            />
                        </div>
                        <div className="flex flex-col text-[7px] text-zinc-500 mt-1">
                            <span>5%</span>
                        </div>
                    </div>
                </div>
            )}

            <Canvas
                camera={{ position: [0, 0.5, compact ? 3 : 2.5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                shadows
            >
                <Suspense fallback={<LoadingFallback />}>
                    <ModelErrorBoundary>
                        {/* Lighting */}
                        <ambientLight intensity={0.5} />
                        <directionalLight
                            position={[3, 5, 4]}
                            intensity={1.2}
                            color="#fff8f0"
                            castShadow
                        />
                        <directionalLight position={[-2, 3, -2]} intensity={0.4} color="#ddeeff" />
                        <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffeedd" />
                        <spotLight
                            position={[-2, 1, -2]}
                            intensity={0.7}
                            color="#4488ff"
                            angle={0.5}
                        />

                        {/* The 3D Human Model */}
                        <HumanModel gender={gender} weight={weight} bodyFat={bodyFat} height={height} />

                        {/* Scanner effect */}
                        <ScanLine />

                        {/* Controls */}
                        <OrbitControls
                            enableZoom={!compact}
                            enablePan={false}
                            minDistance={1.5}
                            maxDistance={4}
                            minPolarAngle={0.3}
                            maxPolarAngle={2.8}
                            autoRotate
                            autoRotateSpeed={compact ? 1 : 0.5}
                        />

                        <Environment preset="studio" />
                    </ModelErrorBoundary>
                </Suspense>
            </Canvas>

            {!compact && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 text-[9px] text-zinc-500">
                    👆 Drag to rotate • Scroll to zoom
                </div>
            )}
        </div>
    );
}

// Export helper for registration preview
export { getBodyFatCategory, getBodyFatColor };
