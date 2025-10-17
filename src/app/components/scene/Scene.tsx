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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    loader.load(
      "/assets/base_avatar.vrm",
      (gltf) => {
        try {
          const vrm = gltf.userData.vrm as VRM;
          if (vrm) {
            vrm.scene.rotation.y = Math.PI;
            setVrm(vrm);
          } else {
            setError("No VRM data found");
          }
        } catch (err) {
          setError("Failed to process VRM");
        }
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Failed to load VRM:', error);
        setError("Failed to load avatar");
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

  if (error || !vrm) {
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
        // SSR protection
        if (typeof window !== 'undefined') {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
      style={{ 
        width: '100%',
        height: '100%',
        display: 'block'
      }}
      gl={{
        antialias: true,
        alpha: false,
      }}
    >
      <color attach="background" args={["#e0e0e0"]} />
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
      />
    </Canvas>
  );
}
