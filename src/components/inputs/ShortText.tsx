'use client'

import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

interface ShortTextProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  minLength?: number
  className?: string
}

export function ShortText({
  value,
  onChange,
  placeholder = 'Share your thoughts...',
  maxLength = 280,
  minLength = 20,
  className,
}: ShortTextProps) {
  const charCount = value.length
  const isOverLimit = charCount > maxLength
  const isBelowMin = charCount > 0 && charCount < minLength
  
  return (
    <div className={cn('space-y-2', className)}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength + 50))} // Allow slight overflow for UX
        placeholder={placeholder}
        className={cn(
          'min-h-[100px] resize-none rounded-xl border-border/50 bg-white/50 p-4 text-base',
          'placeholder:text-muted-foreground/60',
          'focus:border-primary/30 focus:ring-primary/20',
          isOverLimit && 'border-destructive focus:border-destructive'
        )}
      />
      
      <div className="flex justify-between text-xs">
        <span className={cn(
          'text-muted-foreground',
          isBelowMin && 'text-amber-600'
        )}>
          {isBelowMin && `${minLength - charCount} more characters recommended`}
        </span>
        <span className={cn(
          'text-muted-foreground',
          isOverLimit && 'text-destructive font-medium'
        )}>
          {charCount}/{maxLength}
        </span>
      </div>
    </div>
  )
}
