"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";
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
      />
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      camera={{ 
        position: [0, 1.6, 3], 
        fov: 45,
        near: 0.1,
        far: 1000
      }}
      onCreated={({ gl }) => {
        // Performance optimizations
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{ 
        // CRITICAL: Must match the container styling
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'block',
        
        // iOS optimizations
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        
        // Ensure it stays behind the UI
        zIndex: 1
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
      // Use the document body for events to avoid conflicts
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
    >
      <color attach="background" args={["#e0e0e0"]} />
      <Suspense fallback={null}>
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
        
        // Mobile optimizations
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        
        // Performance
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
