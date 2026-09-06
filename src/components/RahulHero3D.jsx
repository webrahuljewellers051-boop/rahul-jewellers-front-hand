import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Text3D, Float, Environment, OrbitControls } from '@react-three/drei';

function GoldText() {
  const meshRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 2) * 0.2 + (state.pointer.x * 0.3);
    meshRef.current.rotation.x = Math.cos(t / 3) * 0.1 - (state.pointer.y * 0.3);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.8}>
      <Center ref={meshRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.6}
          height={0.15}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={5}
        >
          RAHUL JEWELLERS
          <meshStandardMaterial 
            color="#fbbf24" 
            metalness={0.95} 
            roughness={0.15} 
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

export default function RahulHero3D() {
  return (
    <div className="w-full h-[320px] sm:h-[400px] bg-stone-950 relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl my-4">
      <div className="absolute top-3 left-0 right-0 z-10 text-center pointer-events-none">
        <span className="text-[9px] font-bold text-amber-400 tracking-[0.3em] uppercase bg-amber-950/80 px-3 py-1 rounded-full border border-amber-700/50 shadow-md">
          SHEOGANJ 3D EXPERIENCE
        </span>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#0c0a09']} />
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 10, 5]} intensity={2.5} color="#fef08a" />
        <pointLight position={[-10, -10, -5]} intensity={1} color="#d97706" />
        
        <GoldText />
        
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
      </Canvas>
    </div>
  );
}