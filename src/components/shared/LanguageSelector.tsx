'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

export function LanguageSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Hide selector if only one language is available
  if (locales.length <= 1) {
    return null
  }

  const switchLocale = (newLocale: Locale) => {
    // Get the path without the current locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    
    // Navigate to the new locale path
    router.push(`/${newLocale}${pathWithoutLocale}`)
    
    // Save preference
    localStorage.setItem('preferred-locale', newLocale)
    
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-full px-3 py-1.5',
          'bg-white/50 backdrop-blur-sm border border-white/20',
          'text-sm font-medium text-foreground/80',
          'hover:bg-white/70 transition-colors'
        )}
      >
        <span>{localeNames[locale]}</span>
        <svg 
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full mt-2 z-20',
                'right-0 rtl:right-auto rtl:left-0',
                'min-w-[120px] py-1',
                'bg-white/90 backdrop-blur-md rounded-xl border border-white/30',
                'shadow-lg'
              )}
            >
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => switchLocale(loc)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm',
                    'hover:bg-primary/10 transition-colors',
                    locale === loc && 'text-primary font-medium bg-primary/5'
                  )}
                >
                  {localeNames[loc]}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
