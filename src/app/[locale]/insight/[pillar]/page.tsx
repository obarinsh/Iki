'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { BookLayout } from '@/components/shared/BookLayout'
import { useIkigaiStore, IkigaiSection } from '@/lib/store'
import { getPillarById } from '@/lib/questions'
import { cn } from '@/lib/utils'

export default function InsightPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const pillarId = params.pillar as IkigaiSection
  
  const {
    answers,
    pillarInsights,
    setPillarInsight,
    insightLoading,
    setInsightLoading,
    setCurrentPillar,
  } = useIkigaiStore()
  
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const hasFetchedRef = useRef(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const pillar = getPillarById(pillarId)
  const pillarAnswers = answers[pillarId] || []
  const existingInsight = pillarInsights[pillarId]
  
  // Map pillar id to translation key
  const pillarKeyMap: Record<string, string> = {
    'love': 'love',
    'good-at': 'goodAt',
    'world-needs': 'worldNeeds',
    'paid-for': 'paidFor'
  }
  const pillarKey = pillarKeyMap[pillarId]
  
  // Fetch insight if not already cached
  useEffect(() => {
    if (!mounted) return
    if (existingInsight) return
    if (hasFetchedRef.current) return
    if (pillarAnswers.length === 0) {
      router.push(`/${locale}`)
      return
    }
    
    hasFetchedRef.current = true
    
    const fetchInsight = async () => {
      setInsightLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pillarId, answers: pillarAnswers }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 429 || data.error?.includes('rate limit')) {
            setIsRateLimited(true)
            hasFetchedRef.current = false
            return
          }
          throw new Error(data.error || 'Failed to generate insight')
        }
        
        setIsRateLimited(false)
        setPillarInsight(pillarId, data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        hasFetchedRef.current = false // Allow retry on error
      } finally {
        setInsightLoading(false)
      }
    }
    
    fetchInsight()
  }, [mounted, existingInsight, pillarId]) // Minimal dependencies
  
  const handleContinue = () => {
    setCurrentPillar(null)
    router.push(`/${locale}`)
  }
  
  const handleResults = () => {
    router.push(`/${locale}/results`)
  }
  
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  // Show loading while redirecting if no answers
  if (pillarAnswers.length === 0 && !existingInsight) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  return (
    <BookLayout pillar={pillarId} questionIndex={2}>
      <div className="flex min-h-screen flex-col px-6 py-8 lg:px-12 bg-background">
        {/* Header */}
        <header>
          <button 
            onClick={handleContinue}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        {/* Main */}
        <main className="flex flex-1 flex-col items-center justify-center py-8">
          {/* Loading */}
          {insightLoading && (
            <motion.div 
              className="text-center space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <p className="text-muted-foreground">{t('insight.analyzing')}</p>
            </motion.div>
          )}
          
          {/* Rate Limit */}
          {isRateLimited && !insightLoading && !existingInsight && (
            <Card className="p-6 text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">AI Service Busy</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The free AI tier is temporarily limited. You can continue without the insight.
              </p>
              <div className="space-y-2 mt-4">
                <Button onClick={handleContinue} className="w-full">
                  {t('insight.continueAnyway')}
                </Button>
              </div>
            </Card>
          )}
          
          {/* Error */}
          {error && !insightLoading && !isRateLimited && (
            <Card className="p-6 text-center max-w-sm">
              <p className="text-destructive font-medium">{t('insight.error')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button onClick={handleContinue} className="mt-4">
                {t('insight.continueAnyway')}
              </Button>
            </Card>
          )}
          
          {/* Insight */}
          {existingInsight && !insightLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md space-y-6"
            >
              {/* Pillar icon */}
              <div className={cn(
                'mx-auto flex h-16 w-16 items-center justify-center rounded-full',
                'bg-gradient-to-br', pillar.color, 'text-white text-2xl shadow-lg'
              )}>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              
              {/* Title */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{t('insight.whatWeNoticed')}</p>
                <h1 className="font-serif text-2xl font-medium">{t(`pillars.${pillarKey}.title`)}</h1>
              </div>
              
              {/* Insight text */}
              <Card className="p-6 bg-muted/30">
                <p className="text-lg leading-relaxed">
                  {existingInsight.insight}
                </p>
                
                {/* Keywords */}
                {existingInsight.keywords.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {existingInsight.keywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* Actions */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleContinue}
                  className="w-full rounded-full py-6 bg-primary"
                >
                  {t('insight.continueNext')}
                </Button>
                
                <Button
                  onClick={handleResults}
                  variant="ghost"
                  className="w-full text-muted-foreground"
                >
                  {t('insight.viewResults')}
                </Button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </BookLayout>
  )
}
