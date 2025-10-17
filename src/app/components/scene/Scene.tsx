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
            vrm.scene.position.y = 0;
            setVrm(vrm);
            setError(null);
          } else {
            setError("No VRM data found in file");
          }
        } catch (err) {
          setError("Failed to process VRM file");
          console.error('VRM processing error:', err);
        }
        setLoading(false);
      },
      (progress) => {
        // Optional: Add loading progress if needed
        console.log('Loading progress:', (progress.loaded / progress.total) * 100);
      },
      (error) => {
        console.error('Failed to load VRM:', error);
        setError("Failed to load avatar file");
        setLoading(false);
      }
    );
  }, []);

  useFrame((_, delta) => {
    if (vrm) {
      vrm.update(delta);
    }
  });

  // Loading state
  if (loading) {
    return (
      <group>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshBasicMaterial color="#666666" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#6666ff" />
      </group>
    );
  }

  // Error state
  if (error || !vrm) {
    return (
      <group>
        <mesh position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
          <meshBasicMaterial color="#ff4444" transparent opacity={0.8} />
        </mesh>
        <pointLight position={[0, 2, 2]} intensity={0.5} color="#ff6666" />
      </group>
    );
  }

  // Success state - VRM avatar
  return (
    <group>
      <primitive object={vrm.scene} />
    </group>
  );
}

function Floor() {
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, 0, 0]} 
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial 
        color="#444444" 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[3, 5, 5]} 
        intensity={1.0} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={15}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[-5, 3, 2]} intensity={0.3} color="#ffaa33" />
      <pointLight position={[2, 2, -3]} intensity={0.2} color="#66aaff" />
    </>
  );
}

function CameraController() {
  useFrame(({ camera }) => {
    // Smooth camera adjustments can go here if needed
    camera.updateProjectionMatrix();
  });
  return null;
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle resize and focus management
  useEffect(() => {
    const handleResize = () => {
      // Ensure canvas maintains proper dimensions
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
      }
    };

    // Prevent context menu on canvas
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('contextmenu', handleContextMenu);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('contextmenu', handleContextMenu);
      }
      window.removeEventListener('resize', handleResize);
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
        onCreated={({ gl, scene, camera }) => {
          // Optimize performance
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.autoClear = true;
          
          // Scene setup
          scene.fog = new THREE.Fog(0xe0e0e0, 10, 20);
          
          // Camera setup
          camera.layers.enable(0); // Default layer
          camera.layers.enable(1); // UI layer if needed
        }}
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'block',
          touchAction: 'none'
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]} // Adaptive pixel ratio
      >
        <color attach="background" args={["#e0e0e0"]} />
        
        <Suspense fallback={
          <group>
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#888888" transparent opacity={0.6} />
            </mesh>
          </group>
        }>
          <Lights />
          <Avatar />
          <Floor />
          <CameraController />
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
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          // iOS touch handling
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
    </div>
  );
}
