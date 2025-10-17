"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";

function Avatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    loader.load("/assets/base_avatar.vrm", (gltf) => {
      const vrm = gltf.userData.vrm as VRM;
      vrm.scene.rotation.y = Math.PI;
      setVrm(vrm);
    });
  }, []);
  useFrame((_, delta) => vrm?.update(delta));
  return vrm ? <primitive object={vrm.scene} /> : (
    <mesh position={[0, 1.6, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color="#888888" />
    </mesh>
  );
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
      <directionalLight position={[3, 5, 5]} intensity={1.2} castShadow />
    </>
  );
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <div className="fixed inset-0 z-0 overflow-hidden touch-none">
      <Canvas
        ref={canvasRef}
        camera={{ position: [0, 1.6, 3], fov: 45, near: 0.1, far: 1000 }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
        }}
        gl={{ antialias: false, alpha: false, powerPreference: "low-power" }}
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
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        />
      </Canvas>
    </div>
  );
}
