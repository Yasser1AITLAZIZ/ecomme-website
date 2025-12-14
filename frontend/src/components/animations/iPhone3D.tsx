'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function PhoneModel({ rotationSpeed = 0.01 }: { rotationSpeed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current && rotationSpeed > 0) {
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 3, 0.2]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[1.4, 2.8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      {/* Camera notch */}
      <mesh position={[0, 1.3, 0.11]}>
        <boxGeometry args={[0.3, 0.1, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

interface iPhone3DProps {
  className?: string;
  autoRotate?: boolean;
  rotationSpeed?: number;
}

export function iPhone3D({
  className,
  autoRotate = true,
  rotationSpeed = 0.01,
}: iPhone3DProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      // @ts-ignore - motion.div doesn't need these props
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />
          <Environment preset="city" />
          <PhoneModel rotationSpeed={autoRotate ? rotationSpeed : 0} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={2}
            enableDamping
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}

