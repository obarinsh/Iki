'use client'

import { IkigaiSection } from '@/lib/store'
import { InspirationPanel } from './InspirationPanel'

interface BookLayoutProps {
  children: React.ReactNode
  pillar?: IkigaiSection
  questionIndex?: number
  showInspiration?: boolean
}

export function BookLayout({ 
  children, 
  pillar, 
  questionIndex = 0,
  showInspiration = true 
}: BookLayoutProps) {
  return (
    <div className="min-h-screen lg:flex">
      {/* Left side - Content (always visible) */}
      <div className="flex-1 lg:max-w-[55%]">
        {children}
      </div>
      
      {/* Right side - Inspiration (hidden on mobile, visible on lg+) */}
      {showInspiration && pillar && (
        <div className="hidden lg:block lg:w-[45%] lg:min-h-screen sticky top-0">
          <InspirationPanel pillar={pillar} questionIndex={questionIndex} />
        </div>
      )}
    </div>
  )
}
