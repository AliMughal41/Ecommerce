import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Center, Float, MeshTransmissionMaterial, Environment, ContactShadows, Caustics } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Podium ─── */
function Podium() {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      {/* Ring Glow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 2.2, 64]} />
        <meshBasicMaterial color="#C8A56A" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Top layer */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 64]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Gold ring */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.45, 1.55, 64]} />
        <meshStandardMaterial
          color="#C8A56A"
          metalness={0.95}
          roughness={0.1}
          emissive="#C8A56A"
          emissiveIntensity={0.15}
          envMapIntensity={2}
        />
      </mesh>

      {/* Body cylinder */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[1.5, 1.6, 0.3, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
        />
      </mesh>

      {/* Bottom glow ring */}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.7, 48]} />
        <meshBasicMaterial color="#C8A56A" transparent opacity={0.04} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─── Glow Ring ─── */
function GlowRing() {
  const ref = useRef();

  useFrame(({ clock }) => {
    if (ref.current) {
      const pulse = 0.7 + 0.3 * Math.sin(clock.elapsedTime * 2);
      ref.current.material.opacity = pulse * 0.15;
      ref.current.scale.setScalar(1 + 0.02 * Math.sin(clock.elapsedTime * 1.5));
    }
  });

  return (
    <mesh ref={ref} position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.8, 2.4, 64]} />
      <meshBasicMaterial color="#C8A56A" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── Shoe ─── */
function Shoe({ mouse }) {
  const groupRef = useRef();
  const texture = useTexture('/images/image1.png');

  const floatSpeed = 0.8;
  const floatHeight = 0.25;
  const rotSpeed = 0.6;
  const rotRange = 0.07;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    // Float
    groupRef.current.position.y = Math.sin(t * floatSpeed) * floatHeight;

    // Auto rotation
    groupRef.current.rotation.y = Math.sin(t * rotSpeed) * rotRange;

    // Mouse parallax (smooth)
    const targetRotX = -mouse.current[1] * 0.12;
    const targetRotY = mouse.current[0] * 0.15;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (-targetRotX * 0.5 - groupRef.current.rotation.z) * 0.05;
    groupRef.current.position.x += (mouse.current[0] * 0.08 - groupRef.current.position.x) * 0.05;
  });

  return (
    <group ref={groupRef} position={[0, 0.3, 0]}>
      <mesh>
        <planeGeometry args={[3.0, 3.0]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── Particles ─── */
function Particles({ count = 50 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4 + 1;
    }
    return pos;
  }, [count]);

  const speeds = useMemo(() => {
    return Array.from({ length: count }, () => 0.2 + Math.random() * 0.5);
  }, [count]);

  const phases = useMemo(() => {
    return Array.from({ length: count }, () => Math.random() * Math.PI * 2);
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const positions = ref.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const baseY = i * 0.15;
      positions[idx + 1] += Math.sin(t * speeds[i] + phases[i]) * 0.002;
      positions[idx] += Math.cos(t * speeds[i] * 0.7 + phases[i]) * 0.001;
      if (positions[idx + 1] > 3) positions[idx + 1] = -3;
      if (positions[idx + 1] < -3) positions[idx + 1] = 3;
      if (positions[idx] > 4) positions[idx] = -4;
      if (positions[idx] < -4) positions[idx] = 4;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#C8A56A"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─── Light Beams ─── */
function LightBeams() {
  const ref = useRef();
  const beams = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      x: (i - 1.5) * 0.8,
      height: 2.5 + Math.random() * 1.5,
      delay: Math.random() * 3,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const beam = beams[i];
      const opacity = 0.08 + 0.06 * Math.sin(t * 0.8 + beam.delay);
      child.material.opacity = opacity;
    });
  });

  return (
    <group ref={ref} position={[0, 0, -1.5]}>
      {beams.map((beam, i) => (
        <mesh key={i} position={[beam.x, 0, 0]}>
          <planeGeometry args={[0.04, beam.height]} />
          <meshBasicMaterial color="#C8A56A" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Main Scene ─── */
function Scene({ mouse }) {
  return (
    <>
      {/* Environment */}
      <Environment preset="studio" resolution={256} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} color="#ffeedd" />
      <directionalLight position={[-3, 2, 4]} intensity={0.6} color="#C8A56A" />
      <directionalLight position={[0, -2, -5]} intensity={0.3} color="#4466aa" />
      <pointLight position={[2, 4, 3]} intensity={0.4} color="#ffd700" />

      {/* Glow behind shoe */}
      <mesh position={[0, 0.3, -0.8]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#C8A56A" transparent opacity={0.04} />
      </mesh>

      <GlowRing />
      <Podium />
      <Shoe mouse={mouse} />
      <LightBeams />
      <Particles count={50} />

      {/* Contact shadows */}
      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.4}
        scale={5}
        blur={2.5}
        far={1}
      />
    </>
  );
}

/* ─── Canvas Wrapper ─── */
export default function Hero3DScene({ mouse }) {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 3.5], fov: 35, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
      }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Scene mouse={mouse} />
    </Canvas>
  );
}
