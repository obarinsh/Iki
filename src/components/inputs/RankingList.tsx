'use client'

import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'
import { cn } from '@/lib/utils'

interface RankingItem {
  id: string
  label: string
}

interface RankingListProps {
  items: RankingItem[]
  value: string[] // ordered list of ids
  onChange: (value: string[]) => void
  className?: string
}

export function RankingList({
  items,
  value,
  onChange,
  className,
}: RankingListProps) {
  // Sort items based on current value order
  const orderedItems = value.length > 0
    ? value.map(id => items.find(item => item.id === id)!).filter(Boolean)
    : items

  const handleReorder = (newOrder: RankingItem[]) => {
    onChange(newOrder.map(item => item.id))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs text-muted-foreground">
        Drag to reorder by importance to you
      </p>
      
      <Reorder.Group
        axis="y"
        values={orderedItems}
        onReorder={handleReorder}
        className="space-y-2"
      >
        {orderedItems.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3',
                'bg-white/60 border border-border/50',
                'hover:bg-white/80 transition-colors'
              )}
              whileDrag={{ 
                scale: 1.02, 
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                backgroundColor: 'rgba(255,255,255,0.95)'
              }}
            >
              {/* Rank number */}
              <span className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {index + 1}
              </span>
              
              {/* Label */}
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              
              {/* Drag handle indicator */}
              <div className="flex flex-col gap-0.5 opacity-40">
                <div className="h-0.5 w-4 rounded-full bg-current" />
                <div className="h-0.5 w-4 rounded-full bg-current" />
                <div className="h-0.5 w-4 rounded-full bg-current" />
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}
