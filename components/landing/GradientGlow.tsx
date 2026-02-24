interface GradientGlowProps {
  className?: string;
  color?: string;
  opacity?: number;
}

export default function GradientGlow({
  className = '',
  color = '16,185,129',
  opacity = 0.12,
}: GradientGlowProps) {
  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        background: `radial-gradient(ellipse at center, rgba(${color},${opacity}) 0%, transparent 70%)`,
      }}
    />
  );
}
