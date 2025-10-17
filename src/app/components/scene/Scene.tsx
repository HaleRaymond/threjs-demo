"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useState, useRef } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { VRM, VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import * as THREE from "three";

function VRMAvatar() {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    
    setLoading(true);
    setError(null);

    loader.load(
      "/assets/base_avatar.vrm",
      (gltf) => {
        try {
          const vrm = gltf.userData.vrm as VRM;
          if (vrm) {
            // Set up VRM
            VRMUtils.rotateVRM0(vrm);
            vrm.scene.rotation.y = Math.PI;
            vrm.scene.position.y = 0;
            
            // Enable animations if any
            if (gltf.animations && gltf.animations.length > 0) {
              mixerRef.current = new THREE.AnimationMixer(vrm.scene);
              const clip = gltf.animations[0];
              const action = mixerRef.current.clipAction(clip);
              action.play();
            }
            
            setVrm(vrm);
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to process VRM model');
          setLoading(false);
          console.error('VRM processing error:', err);
        }
      },
      (progress) => {
        // Loading progress
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading VRM: ${percent.toFixed(2)}%`);
      },
      (error) => {
        setError('Failed to load VRM file');
        setLoading(false);
        console.error('VRM loading error:', error);
      }
    );

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (vrm) {
        vrm.destroy();
      }
    };
  }, []);

  useFrame((_, delta) => {
    // Update VRM and animations
    if (vrm) {
      vrm.update(delta);
    }
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  if (loading) {
    return (
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
    );
  }

  if (error || !vrm) {
    return (
      <group>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#ff4444" />
        </mesh>
        <pointLight position={[0, 3, 0]} intensity={1} />
      </group>
    );
  }

  return (
    <primitive 
      object={vrm.scene} 
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
    />
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#404040" />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[2, 5, 5]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight
        intensity={0.3}
        groundColor="#444444"
      />
    </>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ 
          position: [0, 1.6, 3], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block'
        }}
        gl={{
          antialias: true,
          alpha: false
        }}
      >
        <color attach="background" args={["#e0e0e0"]} />
        <fog attach="fog" args={["#e0e0e0", 5, 15]} />
        
        <Suspense fallback={
          <mesh position={[0, 1.6, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        }>
          <Lights />
          <VRMAvatar />
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
        />
      </Canvas>
    </div>
  );
}
