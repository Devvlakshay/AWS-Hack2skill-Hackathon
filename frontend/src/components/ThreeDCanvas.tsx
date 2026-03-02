"use client";
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Environment,
  ContactShadows,
  PresentationControls,
} from "@react-three/drei";
import * as THREE from "three";

interface ThreeDCanvasProps {
  imageUrl: string;
  onError?: (msg: string) => void;
}

function GarmentMesh({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <mesh ref={meshRef} castShadow position={[0, 0, 0]}>
      <cylinderGeometry args={[1.2, 1.2, 2.4, 64, 1, true]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        roughness={0.3}
        metalness={0.05}
      />
    </mesh>
  );
}

export default function ThreeDCanvas({ imageUrl, onError }: ThreeDCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      style={{ background: "transparent", height: 380, width: "100%" }}
      shadows
      onError={() => onError?.("Failed to initialize 3D viewer")}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#a78bfa" />
      <pointLight position={[0, 3, 2]} intensity={0.3} color="#ffffff" />

      <PresentationControls
        global
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Math.PI / 2, Math.PI / 2]}
        snap={true}
      >
        <React.Suspense fallback={null}>
          <GarmentMesh imageUrl={imageUrl} />
        </React.Suspense>
      </PresentationControls>

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.35}
        scale={5}
        blur={2.5}
        far={4}
      />

      <Environment preset="studio" />

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={7}
        enableDamping
        dampingFactor={0.06}
      />
    </Canvas>
  );
}
