'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IkigaiSection } from '@/lib/store'
import { getQuoteForQuestion, WisdomQuote } from '@/lib/wisdom'
import { cn } from '@/lib/utils'

interface InspirationPanelProps {
  pillar: IkigaiSection
  questionIndex: number
}

const pillarColors = {
  'love': {
    blob1: 'bg-pink-300',
    blob2: 'bg-rose-200',
    blob3: 'bg-pink-200',
  },
  'good-at': {
    blob1: 'bg-amber-300',
    blob2: 'bg-yellow-200',
    blob3: 'bg-orange-200',
  },
  'world-needs': {
    blob1: 'bg-teal-300',
    blob2: 'bg-emerald-200',
    blob3: 'bg-cyan-200',
  },
  'paid-for': {
    blob1: 'bg-violet-300',
    blob2: 'bg-purple-200',
    blob3: 'bg-indigo-200',
  },
}

export function InspirationPanel({ pillar, questionIndex }: InspirationPanelProps) {
  const [quote, setQuote] = useState<WisdomQuote | null>(null)
  const colors = pillarColors[pillar]
  
  useEffect(() => {
    setQuote(getQuoteForQuestion(pillar, questionIndex))
  }, [pillar, questionIndex])
  
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-background to-muted/30">
      {/* Animated gradient blobs */}
      <motion.div
        className={cn('absolute top-10 left-10 h-64 w-64 rounded-full opacity-60 blur-3xl', colors.blob1)}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={cn('absolute top-1/3 right-10 h-48 w-48 rounded-full opacity-50 blur-3xl', colors.blob2)}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className={cn('absolute bottom-20 left-1/4 h-56 w-56 rounded-full opacity-40 blur-3xl', colors.blob3)}
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -20, 40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
      
      {/* Quote */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-12">
        <AnimatePresence mode="wait">
          {quote && (
            <motion.div
              key={`${pillar}-${questionIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-md text-center"
            >
              <blockquote className="font-serif text-2xl font-medium italic leading-relaxed text-foreground/80">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              <p className="mt-6 text-sm text-muted-foreground">
                {quote.author}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'h-2 w-2 rounded-full',
                questionIndex % 3 === i ? 'bg-foreground/30' : 'bg-foreground/10'
              )}
              animate={{ scale: questionIndex % 3 === i ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
