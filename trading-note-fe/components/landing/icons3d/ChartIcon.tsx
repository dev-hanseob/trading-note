'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ChartIconProps {
  isDark: boolean;
}

const BAR_DATA = [
  { height: 0.8, x: -0.75, color: '#059669' },
  { height: 1.4, x: -0.25, color: '#10b981' },
  { height: 0.6, x: 0.25, color: '#34d399' },
  { height: 1.1, x: 0.75, color: '#6ee7b7' },
];

export default function ChartIcon({ isDark }: ChartIconProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  const baseColor = isDark ? '#334155' : '#cbd5e1';
  const emissiveIntensity = isDark ? 0.25 : 0.08;

  return (
    <Float speed={1.8} rotationIntensity={0.12} floatIntensity={0.35}>
      <group ref={groupRef}>
        {/* Base platform */}
        <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 0.06, 32]} />
          <meshStandardMaterial
            color={baseColor}
            transparent
            opacity={0.5}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Bars */}
        {BAR_DATA.map((bar, i) => (
          <RoundedBox
            key={i}
            args={[0.35, bar.height, 0.35]}
            radius={0.04}
            position={[bar.x, bar.height / 2 - 0.6, 0]}
          >
            <meshStandardMaterial
              color={bar.color}
              emissive={bar.color}
              emissiveIntensity={emissiveIntensity}
              metalness={0.2}
              roughness={0.5}
            />
          </RoundedBox>
        ))}

        <pointLight
          position={[0, 1, 1.5]}
          color="#10b981"
          intensity={isDark ? 1.5 : 0.5}
          distance={5}
        />
      </group>
    </Float>
  );
}
