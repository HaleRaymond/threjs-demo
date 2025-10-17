"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";

function Avatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(
      "/assets/base_avatar.vrm",
      (gltf) => {
        const vrm = gltf.userData.vrm as VRM;
        if (vrm) {
          vrm.scene.rotation.y = Math.PI;
          setVrm(vrm);
        }
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM:', error);
        setLoading(false);
      }
    );
  }, []);

  useFrame((_, delta) => {
    if (vrm) {
      vrm.update(delta);
    }
  });

  if (loading) {
    return (
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#666666" />
      </mesh>
    );
  }

  if (!vrm) {
    return (
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#ff4444" />
      </mesh>
    );
  }

  return <primitive object={vrm.scene} />;
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#90ee90" />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[3, 5, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CRITICAL: iOS/Android touch and focus prevention
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Prevent any focus on canvas (causes keyboard issues)
    const preventFocus = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent context menu on long press
    const preventContextMenu = (e: Event) => {
      e.preventDefault();
    };

    // Prevent any text selection
    const preventSelection = (e: Event) => {
      e.preventDefault();
    };

    // Add all event listeners
    canvas.addEventListener('touchstart', preventFocus, { passive: false });
    canvas.addEventListener('touchend', preventFocus, { passive: false });
    canvas.addEventListener('touchmove', preventFocus, { passive: false });
    canvas.addEventListener('contextmenu', preventContextMenu);
    canvas.addEventListener('selectstart', preventSelection);

    // Critical: Make canvas unfocusable
    canvas.setAttribute('tabindex', '-1');
    canvas.style.outline = 'none';

    return () => {
      canvas.removeEventListener('touchstart', preventFocus);
      canvas.removeEventListener('touchend', preventFocus);
      canvas.removeEventListener('touchmove', preventFocus);
      canvas.removeEventListener('contextmenu', preventContextMenu);
      canvas.removeEventListener('selectstart', preventSelection);
    };
  }, []);

  return (
    <Canvas
      ref={canvasRef}
      camera={{ 
        position: [0, 1.6, 3], 
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      onCreated={({ gl, scene }) => {
        // MOBILE PERFORMANCE OPTIMIZATIONS
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Lower for mobile
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Optimize for mobile
        gl.autoClear = true;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        
        // Scene optimizations
        scene.background = new THREE.Color(0xe0e0e0);
      }}
      style={{ 
        // ABSOLUTELY FIXED - NEVER MOVES
        position: 'fixed',
        top: '0px',
        left: '0px',
        width: '100vw',
        height: '100vh',
        display: 'block',
        
        // iOS/Android critical styles
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        
        // Prevent focus
        outline: 'none',
        
        // Ensure proper stacking
        zIndex: '1',
        
        // Prevent any transforms
        transform: 'none !important'
      }}
      gl={{
        // Mobile performance settings
        antialias: false, // Disable for better performance
        alpha: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        depth: true,
        stencil: false
      }}
      // Mobile-optimized event system
      eventSource={document.body}
      eventPrefix="offset"
      dpr={[1, 1.5]} // Adaptive DPR for mobile
    >
      <Suspense fallback={
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      }>
        <Lights />
        <Avatar />
        <Floor />
      </Suspense>
      
      <OrbitControls 
        target={[0, 1.0, 0]}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={10}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        
        // MOBILE TOUCH OPTIMIZATIONS
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        
        // Performance
        enableDamping={true}
        dampingFactor={0.05}
        
        // Mobile-friendly sensitivity
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
      />
    </Canvas>
  );
}
