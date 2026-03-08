'use client';

import { Canvas } from '@react-three/fiber';
import { IconType } from './ThreeScene';
import LightningIcon from './icons3d/LightningIcon';
import ChartIcon from './icons3d/ChartIcon';
import ChecklistIcon from './icons3d/ChecklistIcon';

interface ThreeCanvasProps {
  iconType: IconType;
  isDark: boolean;
}

const iconComponents = {
  lightning: LightningIcon,
  chart: ChartIcon,
  checklist: ChecklistIcon,
};

export default function ThreeCanvas({ iconType, isDark }: ThreeCanvasProps) {
  const IconComponent = iconComponents[iconType];

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={isDark ? 0.3 : 0.5} />
      <directionalLight position={[5, 5, 5]} intensity={isDark ? 0.5 : 0.7} />
      <IconComponent isDark={isDark} />
    </Canvas>
  );
}
