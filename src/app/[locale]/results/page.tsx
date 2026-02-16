'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { GradientBackground } from '@/components/shared/GradientBackground'
import { useIkigaiStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type RevealStage = 'loading' | 'statement' | 'pillars' | 'intersections' | 'actions' | 'complete'

export default function ResultsPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const {
    answers,
    fullAnalysis,
    setFullAnalysis,
    analysisLoading,
    setAnalysisLoading,
    completedPillars,
    resetAll,
  } = useIkigaiStore()
  
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [revealStage, setRevealStage] = useState<RevealStage>('loading')
  const hasFetchedRef = useRef(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Check if user has any completed pillars
  useEffect(() => {
    if (mounted && completedPillars.length === 0) {
      router.push(`/${locale}`)
    }
  }, [mounted, completedPillars.length, router, locale])
  
  // Fetch analysis
  useEffect(() => {
    if (!mounted) return
    if (fullAnalysis) return
    if (hasFetchedRef.current) return
    
    hasFetchedRef.current = true
    
    const fetchAnalysis = async () => {
      setAnalysisLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          // Check for rate limit
          if (response.status === 429 || data.error?.includes('rate limit')) {
            setIsRateLimited(true)
            setRetryCountdown(30)
            hasFetchedRef.current = false // Allow retry
            return
          }
          throw new Error(data.error || 'Failed to generate analysis')
        }
        
        setIsRateLimited(false)
        setFullAnalysis(data)
        
        // Start reveal sequence
        setRevealStage('statement')
        setTimeout(() => setRevealStage('pillars'), 2000)
        setTimeout(() => setRevealStage('intersections'), 3500)
        setTimeout(() => setRevealStage('actions'), 5000)
        setTimeout(() => setRevealStage('complete'), 6000)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setRevealStage('complete')
        hasFetchedRef.current = false // Allow retry on error
      } finally {
        setAnalysisLoading(false)
      }
    }
    
    fetchAnalysis()
  }, [mounted, fullAnalysis]) // Minimal dependencies
  
  // If already have analysis, skip to complete
  useEffect(() => {
    if (fullAnalysis && revealStage === 'loading') {
      setRevealStage('complete')
    }
  }, [fullAnalysis, revealStage])
  
  // Countdown timer for rate limit retry
  useEffect(() => {
    if (retryCountdown <= 0) return
    
    const timer = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [retryCountdown])
  
  const handleRetry = () => {
    setIsRateLimited(false)
    setError(null)
    hasFetchedRef.current = false
    setRevealStage('loading')
    // Trigger re-fetch by updating mounted state
    setMounted(false)
    setTimeout(() => setMounted(true), 100)
  }
  
  const handleStartOver = () => {
    resetAll()
    router.push(`/${locale}`)
  }
  
  const handleShare = async () => {
    const text = fullAnalysis?.ikigaiStatement || 'Discover your Ikigai'
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Ikigai',
          text: text,
          url: window.location.href,
        })
      } catch (err) {
        // Fallback
        await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
        alert('Copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
      alert('Copied to clipboard!')
    }
  }
  
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  // Show loading while redirecting if no completed pillars
  if (completedPillars.length === 0 && !fullAnalysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  const showStatement = revealStage !== 'loading'
  const showPillars = ['pillars', 'intersections', 'actions', 'complete'].includes(revealStage)
  const showIntersections = ['intersections', 'actions', 'complete'].includes(revealStage)
  const showActions = ['actions', 'complete'].includes(revealStage)

  // Map pillar id to translation key
  const pillarKeyMap: Record<string, string> = {
    'love': 'love',
    'good-at': 'goodAt',
    'world-needs': 'worldNeeds',
    'paid-for': 'paidFor'
  }
  
  return (
    <GradientBackground>
      <div className="min-h-screen px-6 py-8">
        {/* Loading State */}
        <AnimatePresence>
          {revealStage === 'loading' && (
            <motion.div 
              className="flex min-h-[80vh] flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center space-y-4">
                <div className="relative mx-auto h-16 w-16">
                  <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
                </div>
                <p className="text-lg font-medium">{t('results.synthesizing')}</p>
                <p className="text-sm text-muted-foreground">{t('results.findingPatterns')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rate Limit State */}
        {isRateLimited && !fullAnalysis && (
          <div className="flex min-h-[80vh] items-center justify-center">
            <Card className="glass p-6 text-center max-w-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium">AI Service Busy</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The free AI tier has reached its limit. Please wait a moment and try again.
              </p>
              {retryCountdown > 0 ? (
                <p className="mt-4 text-2xl font-mono font-bold text-primary">{retryCountdown}s</p>
              ) : (
                <Button onClick={handleRetry} className="mt-4">
                  {t('common.tryAgain')}
                </Button>
              )}
            </Card>
          </div>
        )}
        
        {/* Error State */}
        {error && !isRateLimited && (
          <div className="flex min-h-[80vh] items-center justify-center">
            <Card className="glass p-6 text-center max-w-sm">
              <p className="text-destructive font-medium">{t('results.error')}</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                {t('common.tryAgain')}
              </Button>
            </Card>
          </div>
        )}
        
        {/* Results */}
        {fullAnalysis && showStatement && (
          <div className="max-w-2xl mx-auto space-y-8">
            
            {/* THE Ikigai Statement - The Screenshot Moment */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center py-12"
            >
              <p className="text-sm text-muted-foreground mb-4">{t('results.yourIkigai')}</p>
              <h1 className="font-serif text-3xl md:text-4xl font-medium italic leading-snug text-foreground">
                &ldquo;{fullAnalysis.ikigaiStatement}&rdquo;
              </h1>
            </motion.section>
            
            {/* Pillar Summaries */}
            <AnimatePresence>
              {showPillars && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <h2 className="font-serif text-xl font-medium">{t('results.fourPillars')}</h2>
                  
                  <Accordion type="single" collapsible className="space-y-2">
                    {fullAnalysis.pillars.map((pillar, index) => (
                      <AccordionItem 
                        key={pillar.id} 
                        value={pillar.id}
                        className="glass rounded-xl border-0 overflow-hidden"
                      >
                        <AccordionTrigger className="px-4 py-3 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <span className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white',
                              index === 0 && 'bg-pink-400',
                              index === 1 && 'bg-amber-400',
                              index === 2 && 'bg-teal-400',
                              index === 3 && 'bg-violet-400',
                            )}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm">
                                {t(`pillars.${pillarKeyMap[pillar.id]}.title`)}
                              </p>
                              <div className="flex gap-1 mt-1">
                                {pillar.keywords.slice(0, 3).map((kw, i) => (
                                  <span key={i} className="text-xs text-muted-foreground">
                                    {kw}{i < 2 && pillar.keywords.length > i + 1 && ' · '}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {pillar.summary}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.section>
              )}
            </AnimatePresence>
            
            {/* Intersections */}
            <AnimatePresence>
              {showIntersections && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <h2 className="font-serif text-xl font-medium">{t('results.whereTheyIntersect')}</h2>
                  
                  <div className="grid gap-3 sm:grid-cols-2">
                    {fullAnalysis.intersections.map((intersection) => (
                      <Card key={intersection.id} className="glass p-4">
                        <p className="font-medium text-sm">{t(`intersections.${intersection.id}.title`)}</p>
                        <p className="text-xs text-muted-foreground mb-2">{t(`intersections.${intersection.id}.subtitle`)}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {intersection.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            
            {/* Career Paths */}
            <AnimatePresence>
              {showActions && fullAnalysis.careerPaths && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <h2 className="font-serif text-xl font-medium">{t('results.pathsWorthExploring')}</h2>
                  
                  <div className="space-y-3">
                    {fullAnalysis.careerPaths.map((path, index) => (
                      <Card key={index} className="glass p-4">
                        <p className="font-medium">{path.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{path.matchReason}</p>
                        <p className="text-sm text-primary mt-2">{t('results.firstStep')}: {path.firstStep}</p>
                      </Card>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            
            {/* Weekly Actions */}
            <AnimatePresence>
              {showActions && fullAnalysis.weeklyActions && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-4"
                >
                  <h2 className="font-serif text-xl font-medium">{t('results.whatToDoThisWeek')}</h2>
                  
                  <div className="space-y-3">
                    {fullAnalysis.weeklyActions.map((action, index) => (
                      <Card key={index} className="glass p-4 flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            
            {/* Footer CTAs */}
            {revealStage === 'complete' && (
              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-4 pt-8 pb-12"
              >
                <div className="flex gap-3">
                  <Button
                    onClick={handleShare}
                    className="flex-1 rounded-full py-6 bg-primary"
                  >
                    {t('common.share')}
                  </Button>
                  <Button
                    onClick={handleStartOver}
                    variant="outline"
                    className="flex-1 rounded-full py-6"
                  >
                    {t('common.startOver')}
                  </Button>
                </div>
                
                <p className="text-center text-xs text-muted-foreground">
                  {t('results.evolves')}
                </p>
              </motion.footer>
            )}
          </div>
        )}
      </div>
    </GradientBackground>
  )
}
