import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Text3D, Float } from '@react-three/drei';

function LogoMesh() {
  const meshRef = useRef();

  // Gentle floating animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 2) * 0.3;
    meshRef.current.rotation.x = Math.cos(t / 4) * 0.1;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Center ref={meshRef}>
        <Text3D
          font="/fonts/Inter_Bold.json" // Path to a typeface json font
          size={1.2}
          height={0.2}
          curveSegments={12}
        >
          RAHUL JEWELLERS
          <meshStandardMaterial 
            color="#f59e0b" // Rich gold color
            metalness={0.9}
            roughness={0.1}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

export default function RahulHero3D() {
  return (
    <div className="w-full h-screen bg-stone-950 relative">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#fde047" />
        <directionalLight position={[-10, -10, -5]} intensity={1} />
        <LogoMesh />
      </Canvas>
    </div>
  );
}