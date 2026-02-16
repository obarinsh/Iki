'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Option {
  id: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  maxSelections?: number
  columns?: 2 | 3
  className?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  maxSelections = 5,
  columns = 2,
  className,
}: MultiSelectProps) {
  const toggleOption = (optionId: string) => {
    if (value.includes(optionId)) {
      onChange(value.filter(id => id !== optionId))
    } else if (value.length < maxSelections) {
      onChange([...value, optionId])
    }
  }

  const isSelected = (optionId: string) => value.includes(optionId)
  const isDisabled = (optionId: string) => !isSelected(optionId) && value.length >= maxSelections

  return (
    <div className={cn('space-y-3', className)}>
      <div 
        className={cn(
          'grid gap-2',
          columns === 2 ? 'grid-cols-2' : 'grid-cols-3'
        )}
      >
        {options.map((option) => (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            disabled={isDisabled(option.id)}
            className={cn(
              'rounded-xl px-4 py-3 text-left text-sm font-medium transition-all',
              'border border-border/50',
              isSelected(option.id)
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-white/50 text-foreground hover:bg-white/80',
              isDisabled(option.id) && 'opacity-40 cursor-not-allowed'
            )}
            whileTap={{ scale: 0.98 }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {value.length} of {maxSelections} selected
      </p>
    </div>
  )
}
