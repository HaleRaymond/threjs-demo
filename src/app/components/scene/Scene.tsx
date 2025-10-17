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
            // AVATAR FACES FRONT (towards camera)
            vrm.scene.rotation.y = 0; // Facing forward (was Math.PI)
            vrm.scene.position.set(0, 0, 0);
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

  // Success state - VRM avatar facing front
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
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[0, 5, 5]}  // Light from front-top
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={15}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[3, 3, 3]} intensity={0.4} color="#ffaa33" />
      <pointLight position={[-3, 2, 3]} intensity={0.3} color="#66aaff" />
    </>
  );
}

function CameraController() {
  useFrame(({ camera }) => {
    // Keep camera looking at avatar from front
    camera.lookAt(0, 1.6, 0);
  });
  return null;
}

export default function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle resize and focus management
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
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
    <div className="w-full h-full">
      <Canvas
        ref={canvasRef}
        camera={{ 
          position: [0, 1.6, 4],  // Camera in front of avatar
          fov: 45,
          near: 0.1,
          far: 1000
        }}
        onCreated={({ gl, scene, camera }) => {
          // Optimize performance for mobile
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.autoClear = true;
          
          // Scene setup
          scene.fog = new THREE.Fog(0xe0e0e0, 10, 20);
          
          // Camera looks at avatar
          camera.lookAt(0, 1.6, 0);
        }}
        style={{ 
          width: '100%',
          height: '100%',
          display: 'block',
          touchAction: 'none'
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#e0e0e0"]} />
        
        <Suspense fallback={
          <group>
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color="#888888" transparent opacity={0.6} />
            </mesh>
            <pointLight position={[0, 2, 2]} intensity={0.3} color="#8888ff" />
          </group>
        }>
          <Lights />
          <Avatar />
          <Floor />
          <CameraController />
        </Suspense>
        
        <OrbitControls 
          target={[0, 1.6, 0]}  // Orbit around avatar's head
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}       // Don't get too close
          maxDistance={8}
          minPolarAngle={0.3}   // Don't go below avatar
          maxPolarAngle={Math.PI - 0.3} // Don't go directly above
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          // Mobile touch handling
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
          }}
          // Performance
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
