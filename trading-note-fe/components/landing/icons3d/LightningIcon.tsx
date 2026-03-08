'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface LightningIconProps {
  isDark: boolean;
}

export default function LightningIcon({ isDark }: LightningIconProps) {
  const groupRef = useRef<THREE.Group>(null);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Lightning bolt path
    s.moveTo(0.1, 1.2);
    s.lineTo(0.6, 1.2);
    s.lineTo(0.2, 0.2);
    s.lineTo(0.55, 0.2);
    s.lineTo(-0.15, -1.2);
    s.lineTo(0.1, -0.1);
    s.lineTo(-0.25, -0.1);
    s.closePath();
    return s;
  }, []);

  const extrudeSettings = useMemo(
    () => ({
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    }),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  const color = '#10b981';
  const emissiveIntensity = isDark ? 0.4 : 0.15;

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        <mesh castShadow>
          <extrudeGeometry args={[shape, extrudeSettings]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
        <pointLight
          position={[0, 0, 1]}
          color={color}
          intensity={isDark ? 2 : 0.8}
          distance={5}
        />
      </group>
    </Float>
  );
}
