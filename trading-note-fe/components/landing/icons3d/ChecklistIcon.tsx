'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ChecklistIconProps {
  isDark: boolean;
}

export default function ChecklistIcon({ isDark }: ChecklistIconProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Checkmark shape
  const checkShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = 0.08; // line width
    // Checkmark path (thick line via shape)
    s.moveTo(-0.35, 0.0);
    s.lineTo(-0.35 + w, 0.0 + w);
    s.lineTo(-0.12, -0.2);
    s.lineTo(0.35, 0.25);
    s.lineTo(0.35 - w, 0.25 + w);
    s.lineTo(-0.12, -0.05);
    s.closePath();
    return s;
  }, []);

  const checkExtrude = useMemo(
    () => ({
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    }),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  const panelColor = isDark ? '#1e293b' : '#e2e8f0';
  const lineColor = isDark ? '#475569' : '#94a3b8';
  const checkColor = '#10b981';
  const emissiveIntensity = isDark ? 0.35 : 0.1;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Shield / Panel body */}
        <RoundedBox args={[1.6, 2.0, 0.18]} radius={0.12} position={[0, 0, 0]}>
          <meshStandardMaterial
            color={panelColor}
            metalness={0.1}
            roughness={0.7}
          />
        </RoundedBox>

        {/* Horizontal lines (representing list items) */}
        {[0.55, 0.15, -0.25].map((y, i) => (
          <mesh key={i} position={[0.15, y, 0.1]}>
            <boxGeometry args={[0.7, 0.06, 0.02]} />
            <meshStandardMaterial color={lineColor} />
          </mesh>
        ))}

        {/* Checkboxes / Check marks */}
        {[0.55, 0.15].map((y, i) => (
          <group key={i} position={[-0.45, y, 0.1]}>
            {/* Checkbox background */}
            <mesh>
              <boxGeometry args={[0.22, 0.22, 0.04]} />
              <meshStandardMaterial
                color={checkColor}
                emissive={checkColor}
                emissiveIntensity={emissiveIntensity}
                metalness={0.2}
                roughness={0.5}
              />
            </mesh>
          </group>
        ))}

        {/* Unchecked box */}
        <group position={[-0.45, -0.25, 0.1]}>
          <mesh>
            <boxGeometry args={[0.22, 0.22, 0.04]} />
            <meshStandardMaterial
              color={lineColor}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>

        {/* Large centered checkmark */}
        <mesh position={[0, -0.7, 0.12]}>
          <extrudeGeometry args={[checkShape, checkExtrude]} />
          <meshStandardMaterial
            color={checkColor}
            emissive={checkColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        <pointLight
          position={[0, 0, 1.5]}
          color={checkColor}
          intensity={isDark ? 1.2 : 0.4}
          distance={5}
        />
      </group>
    </Float>
  );
}
