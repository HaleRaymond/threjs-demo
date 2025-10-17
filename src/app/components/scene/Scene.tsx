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
      />
    </>
  );
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // CRITICAL: iOS touch and focus prevention
  useEffect(() => {
    const preventFocus = (e: TouchEvent) => {
      // Prevent focus on canvas touch (which causes keyboard issues)
      e.preventDefault();
      e.stopPropagation();
    };

    const preventTouchMove = (e: TouchEvent) => {
      // Prevent scroll on canvas
      e.preventDefault();
    };

    const preventContextMenu = (e: Event) => {
      // Prevent context menu on long press
      e.preventDefault();
    };

    const canvas = canvasRef.current;
    if (canvas) {
      // Add all touch event listeners with passive: false for control
      canvas.addEventListener('touchstart', preventFocus, { passive: false });
      canvas.addEventListener('touchend', preventFocus, { passive: false });
      canvas.addEventListener('touchmove', preventTouchMove, { passive: false });
      canvas.addEventListener('touchcancel', preventFocus, { passive: false });
      canvas.addEventListener('contextmenu', preventContextMenu);
      
      // Critical: Set tabIndex to -1 to prevent focus
      canvas.setAttribute('tabindex', '-1');
      canvas.style.outline = 'none';
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('touchstart', preventFocus);
        canvas.removeEventListener('touchend', preventFocus);
        canvas.removeEventListener('touchmove', preventTouchMove);
        canvas.removeEventListener('touchcancel', preventFocus);
        canvas.removeEventListener('contextmenu', preventContextMenu);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [0, 1.6, 3], 
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl }) => {
          // iOS Performance optimizations
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Lower for iOS
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          // iOS critical styles
          touchAction: 'none',
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          zIndex: 1,
          // Prevent focus outline
          outline: 'none'
        }}
        gl={{
          antialias: false, // Disable for iOS performance
          alpha: false,
          powerPreference: "low-power" // Better for iOS
        }}
        // iOS event handling
        eventSource={canvasRef}
        eventPrefix="client"
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
          // iOS touch optimizations
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
    </div>
  );
}
