'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useIkigaiStore } from '@/lib/store'

type RevealStage = 'loading' | 'statement' | 'pillars' | 'intersections' | 'actions' | 'complete'

// Pillar colors
const PILLAR_COLORS = [
  'linear-gradient(135deg, #E8614D 0%, #D4784A 100%)',
  'linear-gradient(135deg, #D4784A 0%, #C49A30 100%)',
  'linear-gradient(135deg, #7BA05B 0%, #5B8BA0 100%)',
  'linear-gradient(135deg, #5B8BA0 0%, #7BA05B 100%)',
]

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
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (mounted && completedPillars.length === 0) {
      router.push(`/${locale}`)
    }
  }, [mounted, completedPillars.length, router, locale])
  
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
          if (response.status === 429 || data.error?.includes('rate limit')) {
            setIsRateLimited(true)
            setRetryCountdown(30)
            hasFetchedRef.current = false
            return
          }
          throw new Error(data.error || 'Failed to generate analysis')
        }
        
        setIsRateLimited(false)
        setFullAnalysis(data)
        
        setRevealStage('statement')
        setTimeout(() => setRevealStage('pillars'), 2000)
        setTimeout(() => setRevealStage('intersections'), 3500)
        setTimeout(() => setRevealStage('actions'), 5000)
        setTimeout(() => setRevealStage('complete'), 6000)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        setRevealStage('complete')
        hasFetchedRef.current = false
      } finally {
        setAnalysisLoading(false)
      }
    }
    
    fetchAnalysis()
  }, [mounted, fullAnalysis])
  
  useEffect(() => {
    if (fullAnalysis && revealStage === 'loading') {
      setRevealStage('complete')
    }
  }, [fullAnalysis, revealStage])
  
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
        await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
        alert('Copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
      alert('Copied to clipboard!')
    }
  }
  
  // Loading spinner component
  const Spinner = () => (
    <>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        border: '4px solid rgba(232,97,77,0.2)',
        borderTopColor: '#E8614D',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
  
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)',
      }}>
        <Spinner />
      </div>
    )
  }
  
  if (completedPillars.length === 0 && !fullAnalysis) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)',
      }}>
        <Spinner />
      </div>
    )
  }
  
  const showStatement = revealStage !== 'loading'
  const showPillars = ['pillars', 'intersections', 'actions', 'complete'].includes(revealStage)
  const showIntersections = ['intersections', 'actions', 'complete'].includes(revealStage)
  const showActions = ['actions', 'complete'].includes(revealStage)

  const pillarKeyMap: Record<string, string> = {
    'love': 'love',
    'good-at': 'goodAt',
    'world-needs': 'worldNeeds',
    'paid-for': 'paidFor'
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: 'linear-gradient(180deg, #F5E8DA 0%, #F2E0D0 50%, #F0DBCB 100%)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <a 
          href={`/${locale}`}
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: '22px',
            color: '#3D2E29',
            letterSpacing: '0.08em',
            textDecoration: 'none',
          }}
        >
          iKi
        </a>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '0 24px 40px' }}>
        {/* Loading State */}
        <AnimatePresence>
          {revealStage === 'loading' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
              }}
            >
              <Spinner />
              <p style={{ marginTop: '20px', fontSize: '17px', fontWeight: 500, color: '#3D2E29' }}>
                {t('results.synthesizing')}
              </p>
              <p style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(61,46,41,0.55)', fontWeight: 300 }}>
                {t('results.findingPatterns')}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Rate Limit State */}
        {isRateLimited && !fullAnalysis && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}>
            <div style={{
              padding: '32px',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(61,46,41,0.08)',
              textAlign: 'center',
              maxWidth: '360px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ fontWeight: 500, color: '#3D2E29', marginBottom: '8px' }}>AI Service Busy</p>
              <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.55)', fontWeight: 300, marginBottom: '20px' }}>
                The free AI tier has reached its limit. Please wait a moment and try again.
              </p>
              {retryCountdown > 0 ? (
                <p style={{ fontSize: '28px', fontWeight: 700, color: '#E8614D', fontFamily: 'monospace' }}>
                  {retryCountdown}s
                </p>
              ) : (
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '12px 24px',
                    background: '#E8614D',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t('common.tryAgain')}
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !isRateLimited && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}>
            <div style={{
              padding: '32px',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(61,46,41,0.08)',
              textAlign: 'center',
              maxWidth: '360px',
            }}>
              <p style={{ fontWeight: 500, color: '#DC2626', marginBottom: '8px' }}>{t('results.error')}</p>
              <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.55)', fontWeight: 300, marginBottom: '20px' }}>{error}</p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 24px',
                  background: '#E8614D',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        )}
        
        {/* Results */}
        {fullAnalysis && showStatement && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            
            {/* THE Ikigai Statement */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ textAlign: 'center', padding: '48px 0' }}
            >
              <p style={{ fontSize: '13px', color: 'rgba(61,46,41,0.45)', fontWeight: 300, marginBottom: '16px' }}>
                {t('results.yourIkigai')}
              </p>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(24px, 5vw, 36px)',
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 1.4,
                color: '#3D2E29',
              }}>
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
                  style={{ marginBottom: '32px' }}
                >
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#3D2E29',
                    marginBottom: '16px',
                  }}>
                    {t('results.fourPillars')}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fullAnalysis.pillars.map((pillar, index) => (
                      <div 
                        key={pillar.id}
                        style={{
                          background: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.6)',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)}
                          style={{
                            width: '100%',
                            padding: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          <span style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: PILLAR_COLORS[index],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#fff',
                            flexShrink: 0,
                          }}>
                            {index + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 500, fontSize: '14px', color: '#3D2E29', marginBottom: '4px' }}>
                              {t(`pillars.${pillarKeyMap[pillar.id]}.title`)}
                            </p>
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                              {pillar.keywords.slice(0, 3).map((kw, i) => (
                                <span key={i} style={{ fontSize: '12px', color: 'rgba(61,46,41,0.5)' }}>
                                  {kw}{i < 2 && pillar.keywords.length > i + 1 && ' · '}
                                </span>
                              ))}
                            </div>
                          </div>
                          <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="rgba(61,46,41,0.4)" 
                            strokeWidth="2"
                            style={{
                              transform: expandedPillar === pillar.id ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s ease',
                            }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {expandedPillar === pillar.id && (
                          <div style={{
                            padding: '0 16px 16px',
                            borderTop: '1px solid rgba(61,46,41,0.06)',
                          }}>
                            <p style={{
                              fontSize: '14px',
                              lineHeight: 1.7,
                              color: 'rgba(61,46,41,0.7)',
                              fontWeight: 300,
                              paddingTop: '12px',
                            }}>
                              {pillar.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                  style={{ marginBottom: '32px' }}
                >
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#3D2E29',
                    marginBottom: '16px',
                  }}>
                    {t('results.whereTheyIntersect')}
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '12px',
                  }}>
                    {fullAnalysis.intersections.map((intersection) => (
                      <div 
                        key={intersection.id}
                        style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.6)',
                        }}
                      >
                        <p style={{ fontWeight: 500, fontSize: '14px', color: '#3D2E29', marginBottom: '2px' }}>
                          {t(`intersections.${intersection.id}.title`)}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(61,46,41,0.4)', fontWeight: 300, marginBottom: '10px' }}>
                          {t(`intersections.${intersection.id}.subtitle`)}
                        </p>
                        <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(61,46,41,0.7)', fontWeight: 300 }}>
                          {intersection.description}
                        </p>
                      </div>
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
                  style={{ marginBottom: '32px' }}
                >
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#3D2E29',
                    marginBottom: '16px',
                  }}>
                    {t('results.pathsWorthExploring')}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fullAnalysis.careerPaths.map((path, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.6)',
                        }}
                      >
                        <p style={{ fontWeight: 500, fontSize: '15px', color: '#3D2E29', marginBottom: '6px' }}>
                          {path.title}
                        </p>
                        <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.6)', fontWeight: 300, marginBottom: '10px' }}>
                          {path.matchReason}
                        </p>
                        <p style={{ fontSize: '13px', color: '#E8614D', fontWeight: 500 }}>
                          {t('results.firstStep')}: {path.firstStep}
                        </p>
                      </div>
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
                  style={{ marginBottom: '32px' }}
                >
                  <h2 style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: '20px',
                    fontWeight: 400,
                    color: '#3D2E29',
                    marginBottom: '16px',
                  }}>
                    {t('results.whatToDoThisWeek')}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fullAnalysis.weeklyActions.map((action, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.5)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '14px',
                          border: '1px solid rgba(255,255,255,0.6)',
                          display: 'flex',
                          gap: '14px',
                        }}
                      >
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(232,97,77,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#E8614D',
                          flexShrink: 0,
                        }}>
                          {index + 1}
                        </span>
                        <div>
                          <p style={{ fontWeight: 500, fontSize: '14px', color: '#3D2E29', marginBottom: '4px' }}>
                            {action.title}
                          </p>
                          <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.6)', fontWeight: 300, lineHeight: 1.5 }}>
                            {action.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            
            {/* Footer CTAs */}
            {revealStage === 'complete' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ paddingTop: '24px', paddingBottom: '32px' }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <button
                    onClick={handleShare}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: '#E8614D',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      boxShadow: '0 4px 20px rgba(232,97,77,0.25)',
                    }}
                  >
                    {t('common.share')}
                  </button>
                  <button
                    onClick={handleStartOver}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      background: 'rgba(255,255,255,0.5)',
                      color: '#3D2E29',
                      border: '1px solid rgba(61,46,41,0.1)',
                      borderRadius: '14px',
                      fontSize: '15px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {t('common.startOver')}
                  </button>
                </div>
                
                <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(61,46,41,0.4)', fontWeight: 300 }}>
                  {t('results.evolves')}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px',
        borderTop: '1px solid rgba(61,46,41,0.04)',
        background: '#FFFBF9',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '12px', color: 'rgba(61,46,41,0.35)', fontWeight: 300 }}>
          Built with care · Free forever · Your data stays private
        </p>
      </footer>
    </div>
  )
}
