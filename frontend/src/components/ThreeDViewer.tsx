"use client";

/**
 * ThreeDViewer - Simple 3D rotation viewer for try-on result images.
 * Renders the try-on image as a texture on a curved cylindrical surface.
 * User can rotate with mouse drag (orbit controls).
 */

import React, { useRef, useEffect, useState } from "react";

interface ThreeDViewerProps {
  imageUrl: string;
}

export default function ThreeDViewer({ imageUrl }: ThreeDViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        // Dynamically import Three.js
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");

        if (cancelled || !containerRef.current) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111827);

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        camera.position.set(0, 0, 3.5);

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.minDistance = 2;
        controls.maxDistance = 6;
        controls.enablePan = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 3, 4);
        scene.add(directionalLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(-2, 1, -3);
        scene.add(backLight);

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = "anonymous";
        textureLoader.load(
          imageUrl,
          (texture) => {
            if (cancelled) return;

            texture.colorSpace = THREE.SRGBColorSpace;

            // Create a curved cylinder segment to map the image onto
            const aspectRatio = texture.image.height / texture.image.width;
            const cylinderRadius = 2;
            const cylinderHeight = 2.5 * aspectRatio;
            const thetaLength = Math.PI * 0.6; // ~108 degree arc

            const geometry = new THREE.CylinderGeometry(
              cylinderRadius,
              cylinderRadius,
              cylinderHeight,
              64,
              1,
              true,
              -thetaLength / 2 + Math.PI,
              thetaLength
            );

            const material = new THREE.MeshStandardMaterial({
              map: texture,
              side: THREE.DoubleSide,
              roughness: 0.4,
              metalness: 0.0,
            });

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            setLoading(false);
          },
          undefined,
          () => {
            if (!cancelled) {
              setError("Failed to load image for 3D view");
              setLoading(false);
            }
          }
        );

        // Animation loop
        let animFrameId: number;
        const animate = () => {
          animFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle resize
        const onResize = () => {
          if (!container) return;
          const w = container.clientWidth;
          const h = container.clientHeight;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // Cleanup function
        cleanupRef.current = () => {
          cancelled = true;
          cancelAnimationFrame(animFrameId);
          window.removeEventListener("resize", onResize);
          controls.dispose();
          renderer.dispose();
          if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
        };
      } catch (err) {
        if (!cancelled) {
          setError("Failed to initialize 3D viewer. Make sure Three.js is installed.");
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [imageUrl]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* 3D View label */}
      <div className="absolute top-3 left-3 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
        3D View
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-gray-300 text-xs px-3 py-1.5 rounded">
        Drag to rotate | Scroll to zoom
      </div>

      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto" />
            <p className="text-gray-400 text-sm mt-3">Loading 3D view...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-2xl">
          <div className="text-center px-6">
            <svg className="w-10 h-10 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-400 text-sm mt-2">{error}</p>
          </div>
        </div>
      )}

      {/* Three.js canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden"
      />
    </div>
  );
}
