'use client'

import { cn } from '@/lib/utils'

interface SpectrumSliderProps {
  leftLabel: string
  rightLabel: string
  value: number // 0-100
  onChange: (value: number) => void
  className?: string
}

export function SpectrumSlider({
  leftLabel,
  rightLabel,
  value,
  onChange,
  className,
}: SpectrumSliderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Labels */}
      <div className="flex justify-between text-sm">
        <span className={cn(
          'transition-all',
          value < 40 ? 'font-medium text-foreground' : 'text-muted-foreground'
        )}>
          {leftLabel}
        </span>
        <span className={cn(
          'transition-all',
          value > 60 ? 'font-medium text-foreground' : 'text-muted-foreground'
        )}>
          {rightLabel}
        </span>
      </div>
      
      {/* Slider track */}
      <div className="relative">
        <div className="h-2 rounded-full bg-gradient-to-r from-gradient-pink via-gradient-peach to-gradient-orange opacity-30" />
        <div 
          className="absolute top-0 h-2 rounded-full bg-gradient-to-r from-gradient-pink via-gradient-peach to-gradient-orange"
          style={{ width: `${value}%` }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        />
        {/* Thumb indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-primary shadow-md transition-all"
          style={{ left: `calc(${value}% - 10px)` }}
        />
      </div>
      
      {/* Value indicator */}
      <p className="text-xs text-muted-foreground text-center">
        {value < 40 ? `Leaning toward ${leftLabel.toLowerCase()}` : 
         value > 60 ? `Leaning toward ${rightLabel.toLowerCase()}` : 
         'Balanced between both'}
      </p>
    </div>
  )
}
