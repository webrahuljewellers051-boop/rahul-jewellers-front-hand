import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Text3D, Float, Environment, OrbitControls } from '@react-three/drei';

function GoldText() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 2) * 0.15;
    meshRef.current.rotation.x = Math.cos(t / 3) * 0.05;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
      <Center ref={meshRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.45}
          height={0.12}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.015}
          bevelSize={0.015}
          bevelSegments={5}
        >
          RAHUL JEWELLERS
          <meshStandardMaterial 
            color="#fbbf24" 
            metalness={0.98} 
            roughness={0.1} 
            envMapIntensity={2}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

export default function RahulHero3D() {
  return (
    <div className="w-full h-[180px] sm:h-[220px] bg-stone-950 relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-xl my-2">
      <div className="absolute top-2 left-0 right-0 z-10 text-center pointer-events-none">
        <span className="text-[8px] font-bold text-amber-400 tracking-[0.3em] uppercase bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-700/50 shadow-md">
          SHEOGANJ 3D EXPERIENCE
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <color attach="background" args={['#0c0a09']} />
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={3} color="#fef08a" />
        <pointLight position={[-10, -10, -5]} intensity={1.5} color="#d97706" />
        
        <GoldText />
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}