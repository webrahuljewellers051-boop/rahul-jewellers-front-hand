
import React, { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Center,
  Text3D,
  Float,
  Environment,
} from "@react-three/drei";

function GoldText() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t / 3) * 0.10;
    meshRef.current.rotation.x = Math.cos(t / 4) * 0.025;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.2}>
      <Center ref={meshRef}>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_bold.typeface.json"
          size={0.42}
          height={0.10}
          curveSegments={16}
          bevelEnabled
          bevelThickness={0.015}
          bevelSize={0.012}
          bevelSegments={4}
        >
          RAHUL JEWELLERS
          <meshStandardMaterial
            color="#e0bd72"
            metalness={0.95}
            roughness={0.2}
            envMapIntensity={1.5}
          />
        </Text3D>
      </Center>
    </Float>
  );
}

export default function RahulHero3D() {
  return (
    <section className="relative my-4 h-[200px] w-full overflow-hidden rounded-2xl border border-[#c9a45c]/30 bg-[#090707] shadow-xl sm:h-[260px] lg:h-[300px]">

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,164,92,0.18),transparent_65%)]" />

      <div className="absolute left-0 right-0 top-3 z-10 text-center">
        <span className="rounded-full border border-[#c9a45c]/40 bg-[#25180e]/80 px-3 py-1 text-[8px] font-semibold tracking-[3px] text-[#e8c982] sm:text-[9px]">
          SHEOGANJ • FINE JEWELLERY
        </span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />

        <directionalLight
          position={[5, 5, 5]}
          intensity={2}
          color="#fff0c2"
        />

        <pointLight
          position={[-5, -3, 3]}
          intensity={12}
          color="#b47a32"
        />

        <Suspense fallback={null}>
          <GoldText />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute bottom-5 left-0 right-0 z-10 text-center">
        <p className="font-serif text-[10px] tracking-[4px] text-[#e8d1a0] sm:text-xs">
          ELEGANCE • HERITAGE • TRUST
        </p>
      </div>
    </section>
  );
}
