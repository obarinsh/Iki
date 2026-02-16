'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useIkigaiStore, IkigaiSection } from '@/lib/store'
import { getPillarById } from '@/lib/questions'

// Pillar colors for the icon
const PILLAR_COLORS: Record<string, string> = {
  'love': 'linear-gradient(135deg, #E8614D 0%, #D4784A 100%)',
  'good-at': 'linear-gradient(135deg, #D4784A 0%, #C49A30 100%)',
  'world-needs': 'linear-gradient(135deg, #7BA05B 0%, #5B8BA0 100%)',
  'paid-for': 'linear-gradient(135deg, #5B8BA0 0%, #7BA05B 100%)',
}

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
  
  const pillarKeyMap: Record<string, string> = {
    'love': 'love',
    'good-at': 'goodAt',
    'world-needs': 'worldNeeds',
    'paid-for': 'paidFor'
  }
  const pillarKey = pillarKeyMap[pillarId]
  
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
        hasFetchedRef.current = false
      } finally {
        setInsightLoading(false)
      }
    }
    
    fetchInsight()
  }, [mounted, existingInsight, pillarId])
  
  const handleContinue = () => {
    setCurrentPillar(null)
    router.push(`/${locale}`)
  }
  
  const handleResults = () => {
    router.push(`/${locale}/results`)
  }
  
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '4px solid rgba(232,97,77,0.2)',
          borderTopColor: '#E8614D',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }
  
  if (pillarAnswers.length === 0 && !existingInsight) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '4px solid rgba(232,97,77,0.2)',
          borderTopColor: '#E8614D',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
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
        <button 
          onClick={handleContinue}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3D2E29" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        {/* Loading */}
        {insightLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              border: '4px solid rgba(232,97,77,0.2)',
              borderTopColor: '#E8614D',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{ color: 'rgba(61,46,41,0.55)', fontSize: '15px', fontWeight: 300 }}>
              {t('insight.analyzing')}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}
        
        {/* Rate Limit */}
        {isRateLimited && !insightLoading && !existingInsight && (
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
              The free AI tier is temporarily limited. You can continue without the insight.
            </p>
            <button
              onClick={handleContinue}
              style={{
                width: '100%',
                padding: '14px 24px',
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
              {t('insight.continueAnyway')}
            </button>
          </div>
        )}
        
        {/* Error */}
        {error && !insightLoading && !isRateLimited && (
          <div style={{
            padding: '32px',
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            border: '1px solid rgba(61,46,41,0.08)',
            textAlign: 'center',
            maxWidth: '360px',
          }}>
            <p style={{ fontWeight: 500, color: '#DC2626', marginBottom: '8px' }}>{t('insight.error')}</p>
            <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.55)', fontWeight: 300, marginBottom: '20px' }}>{error}</p>
            <button
              onClick={handleContinue}
              style={{
                width: '100%',
                padding: '14px 24px',
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
              {t('insight.continueAnyway')}
            </button>
          </div>
        )}
        
        {/* Insight */}
        {existingInsight && !insightLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: '480px', width: '100%' }}
          >
            {/* Pillar icon */}
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 24px',
              borderRadius: '50%',
              background: PILLAR_COLORS[pillarId] || PILLAR_COLORS['love'],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(232,97,77,0.25)',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            
            {/* Title */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(61,46,41,0.45)', fontWeight: 300, marginBottom: '4px' }}>
                {t('insight.whatWeNoticed')}
              </p>
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#3D2E29',
              }}>
                {t(`pillars.${pillarKey}.title`)}
              </h1>
            </div>
            
            {/* Insight card */}
            <div style={{
              padding: '28px',
              background: 'rgba(255,255,255,0.5)',
              backdropFilter: 'blur(8px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.6)',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#3D2E29',
                fontWeight: 300,
              }}>
                {existingInsight.insight}
              </p>
              
              {/* Keywords */}
              {existingInsight.keywords.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(61,46,41,0.06)',
                }}>
                  {existingInsight.keywords.map((keyword, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: 'rgba(232,97,77,0.1)',
                        color: '#E8614D',
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={handleContinue}
                style={{
                  width: '100%',
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
                  transition: 'all 0.25s ease',
                }}
              >
                {t('insight.continueNext')}
              </button>
              
              <button
                onClick={handleResults}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  background: 'none',
                  color: 'rgba(61,46,41,0.4)',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 300,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {t('insight.viewResults')}
              </button>
            </div>
          </motion.div>
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
