'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
}

function getVariants(direction: Direction, distance: number): Variants {
  const hidden: Record<string, number> = { opacity: 0 };
  if (direction === 'up') hidden.y = distance;
  if (direction === 'down') hidden.y = -distance;
  if (direction === 'left') hidden.x = distance;
  if (direction === 'right') hidden.x = -distance;

  return {
    hidden,
    visible: { opacity: 1, x: 0, y: 0 },
  };
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40,
  className,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      variants={getVariants(direction, distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-80px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
