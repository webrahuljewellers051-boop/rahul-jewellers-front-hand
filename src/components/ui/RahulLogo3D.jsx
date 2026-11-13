
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  Text3D,
  Float,
  Environment,
} from "@react-three/drei";

function LogoMesh() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 3) * 0.13;
    meshRef.current.rotation.x = Math.cos(t / 4) * 0.025;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.1} floatIntensity={0.2}>
      <Center ref={meshRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.8}
          height={0.12}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.025}
          bevelSize={0.015}
          bevelSegments={4}
        >
          RAHUL
          <meshStandardMaterial
            color="#dfbb70"
            metalness={0.98}
            roughness={0.18}
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

export default function RahulLogo3D() {
  return (
    <div
      className="relative h-[180px] w-full overflow-hidden rounded-xl bg-[#090707] sm:h-[220px]"
      aria-label="Rahul Jewellers 3D logo"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.17),transparent_65%)]" />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />

        <pointLight
          position={[4, 4, 5]}
          intensity={20}
          color="#ffe3a1"
        />

        <pointLight
          position={[-4, -2, 3]}
          intensity={10}
          color="#a87932"
        />

        <Suspense fallback={null}>
          <LogoMesh />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute bottom-4 left-0 right-0 text-center">
        <p className="font-serif text-sm tracking-[5px] text-[#e8d1a0]">
          JEWELLERS
        </p>
        <div className="mx-auto mt-2 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent" />
      </div>
    </div>
  );
}
