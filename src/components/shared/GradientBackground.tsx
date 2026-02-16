'use client'

import { motion } from 'framer-motion'

interface GradientBackgroundProps {
  variant?: 'default' | 'love' | 'good-at' | 'world-needs' | 'paid-for'
  children: React.ReactNode
}

const colorVariants = {
  default: {
    blob1: 'bg-gradient-peach',
    blob2: 'bg-gradient-pink', 
    blob3: 'bg-gradient-orange',
    blob4: 'bg-gradient-yellow',
  },
  love: {
    blob1: 'bg-[#FFB5C5]',
    blob2: 'bg-[#FFCBA4]',
    blob3: 'bg-[#FFD1DC]',
    blob4: 'bg-[#FFC0CB]',
  },
  'good-at': {
    blob1: 'bg-[#FFAC38]',
    blob2: 'bg-[#FFD700]',
    blob3: 'bg-[#FFCBA4]',
    blob4: 'bg-[#FFA500]',
  },
  'world-needs': {
    blob1: 'bg-[#98D8C8]',
    blob2: 'bg-[#7FCDCD]',
    blob3: 'bg-[#FFCBA4]',
    blob4: 'bg-[#87CEEB]',
  },
  'paid-for': {
    blob1: 'bg-[#DDA0DD]',
    blob2: 'bg-[#E6E6FA]',
    blob3: 'bg-[#FFCBA4]',
    blob4: 'bg-[#D8BFD8]',
  },
}

export function GradientBackground({ variant = 'default', children }: GradientBackgroundProps) {
  const colors = colorVariants[variant]
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={`absolute -top-40 -left-40 h-80 w-80 rounded-full ${colors.blob1} opacity-60 blur-3xl`}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className={`absolute top-1/4 right-0 h-96 w-96 rounded-full ${colors.blob2} opacity-50 blur-3xl`}
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -30, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div
          className={`absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full ${colors.blob3} opacity-50 blur-3xl`}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -20, 40, 0],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        <motion.div
          className={`absolute -bottom-20 right-1/4 h-64 w-64 rounded-full ${colors.blob4} opacity-40 blur-3xl`}
          animate={{
            x: [0, -30, 40, 0],
            y: [0, 40, -20, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 6,
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
