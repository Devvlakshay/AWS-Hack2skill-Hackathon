"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({
  count = 120,
  color = "#8b5cf6",
  size = 0.018,
  speed = 0.18,
}: {
  count?: number;
  color?: string;
  size?: number;
  speed?: number;
}) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3]     = (Math.random() - 0.5) * 20;
      pos[i3 + 1] = (Math.random() - 0.5) * 20;
      pos[i3 + 2] = (Math.random() - 0.5) * 8;
      vel[i3]     = (Math.random() - 0.5) * 0.003;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.003;
    }
    return [pos, vel];
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    const attr = mesh.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3]     += velocities[i3]     * speed;
      arr[i3 + 1] += velocities[i3 + 1] * speed;
      if (arr[i3]     >  10) arr[i3]     = -10;
      if (arr[i3]     < -10) arr[i3]     =  10;
      if (arr[i3 + 1] >  10) arr[i3 + 1] = -10;
      if (arr[i3 + 1] < -10) arr[i3 + 1] =  10;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function OrbitRing() {
  const mesh = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(50 * 3);
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 5 + Math.random() * 5;
      pos[i * 3]     = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (mesh.current) mesh.current.rotation.z = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#f59e0b" transparent opacity={0.22} sizeAttenuation depthWrite={false} />
    </points>
  );
}

interface Props {
  className?: string;
  particleCount?: number;
  variant?: "hero" | "subtle";
}

export function ParticleCanvas({ particleCount = 120, variant = "hero" }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: "transparent" }}
      dpr={[1, 1.5]}
    >
      <Particles count={particleCount} color="#8b5cf6" size={variant === "hero" ? 0.018 : 0.011} speed={0.16} />
      {variant === "hero" && <OrbitRing />}
    </Canvas>
  );
}

export default function ParticleBackground({ className = "", particleCount, variant }: Props) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <ParticleCanvas particleCount={particleCount} variant={variant} />
    </div>
  );
}
