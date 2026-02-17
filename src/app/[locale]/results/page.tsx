'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useIkigaiStore } from '@/lib/store'

// Pillar configuration
const PILLAR_CONFIG = [
  { id: 'love', label: 'What You Love', shortLabel: 'Love', num: '01', color: '#E8614D' },
  { id: 'good-at', label: "What You're Good At", shortLabel: 'Skills', num: '02', color: '#D4784A' },
  { id: 'world-needs', label: 'What the World Needs', shortLabel: 'Needs', num: '03', color: '#7BA05B' },
  { id: 'paid-for', label: 'What You Can Be Paid For', shortLabel: 'Paid For', num: '04', color: '#5B8BA0' },
]

// Radar Chart Component
function RadarChart({ 
  pillars, 
  hoveredPillar, 
  onHover, 
  onLeave 
}: { 
  pillars: { id: string; score: number; potential: number }[]
  hoveredPillar: string | null
  onHover: (id: string) => void
  onLeave: () => void
}) {
  const cx = 200, cy = 200, maxR = 130
  const axes = pillars.length

  function polarToCart(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180)
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }
  function getAngle(i: number) { return (360 / axes) * i }

  const rings = [2, 4, 6, 8, 10]
  const scorePoints = pillars.map((p, i) => { 
    const pt = polarToCart(getAngle(i), (p.score / 10) * maxR)
    return `${pt.x},${pt.y}`
  }).join(" ")
  const potentialPoints = pillars.map((p, i) => { 
    const pt = polarToCart(getAngle(i), (p.potential / 10) * maxR)
    return `${pt.x},${pt.y}`
  }).join(" ")

  // Label positions for 4 pillars (top, right, bottom, left)
  const labelPositions = [
    { x: cx, y: 30, anchor: 'middle' as const },      // Top - Love
    { x: 370, y: cy, anchor: 'end' as const },        // Right - Skills
    { x: cx, y: 380, anchor: 'middle' as const },     // Bottom - Needs
    { x: 30, y: cy, anchor: 'start' as const },       // Left - Paid For
  ]

  return (
    <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: "380px" }}>
      {/* Grid rings */}
      {rings.map((ring) => {
        const r = (ring / 10) * maxR
        const pts = Array.from({ length: axes }, (_, i) => { 
          const pt = polarToCart(getAngle(i), r)
          return `${pt.x},${pt.y}`
        }).join(" ")
        return <polygon key={ring} points={pts} fill="none" stroke="rgba(61,46,41,0.06)" strokeWidth="1" />
      })}
      {/* Ring labels */}
      {[4, 6, 8, 10].map((ring) => (
        <text key={ring} x={cx + 4} y={cy - (ring / 10) * maxR + 3} style={{ fontSize: "9px", fill: "rgba(61,46,41,0.18)", fontFamily: "'DM Sans',sans-serif", fontWeight: 300 }}>{ring}</text>
      ))}
      {/* Axis lines */}
      {pillars.map((_, i) => { 
        const pt = polarToCart(getAngle(i), maxR)
        return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="rgba(61,46,41,0.06)" strokeWidth="1" />
      })}
      {/* Potential area (dashed) */}
      <polygon points={potentialPoints} fill="rgba(225,185,55,0.07)" stroke="rgba(196,154,48,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />
      {/* Score area */}
      <polygon points={scorePoints} fill="rgba(232,97,77,0.1)" stroke="#E8614D" strokeWidth="2" />
      {/* Data points */}
      {pillars.map((p, i) => {
        const config = PILLAR_CONFIG[i]
        const pt = polarToCart(getAngle(i), (p.score / 10) * maxR)
        const isH = hoveredPillar === p.id
        return (
          <circle 
            key={`d-${i}`} 
            cx={pt.x} 
            cy={pt.y} 
            r={isH ? 6 : 4} 
            fill={config.color} 
            stroke="#fff" 
            strokeWidth="2" 
            style={{ transition: "all 0.2s ease", cursor: "pointer" }} 
            onMouseEnter={() => onHover(p.id)} 
            onMouseLeave={onLeave} 
          />
        )
      })}
      {/* Labels */}
      {pillars.map((p, i) => {
        const config = PILLAR_CONFIG[i]
        const pos = labelPositions[i]
        const isH = hoveredPillar === p.id
        const isO = hoveredPillar && hoveredPillar !== p.id
        return (
          <g key={`l-${i}`} style={{ cursor: "pointer" }} onMouseEnter={() => onHover(p.id)} onMouseLeave={onLeave}>
            <text x={pos.x} y={pos.y} textAnchor={pos.anchor} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", fontWeight: 500, fill: isH ? config.color : isO ? "rgba(61,46,41,0.15)" : "rgba(61,46,41,0.55)", transition: "fill 0.25s ease" }}>{config.shortLabel}</text>
            <text x={pos.x} y={pos.y + 14} textAnchor={pos.anchor} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "11px", fontWeight: 300, fill: isH ? config.color : isO ? "rgba(61,46,41,0.1)" : "rgba(61,46,41,0.3)", transition: "fill 0.25s ease" }}>{p.score.toFixed(1)}/10</text>
          </g>
        )
      })}
      {/* Center text */}
      <text x={cx} y={cy + 4} textAnchor="middle" style={{ fontFamily: "'Instrument Serif',serif", fontSize: "13px", fill: "rgba(61,46,41,0.12)", letterSpacing: "0.06em" }}>IKIGAI</text>
    </svg>
  )
}

// Side Navigation
function SideNav({ active, onNav, revealed }: { active: string; onNav: (id: string) => void; revealed: Set<string> }) {
  const items = [
    { id: "statement", label: "Ikigai" },
    { id: "chart", label: "Radar" },
    { id: "intersections", label: "Intersections" },
    { id: "paths", label: "Paths" },
    { id: "actions", label: "This Week" },
  ]
  return (
    <div style={{ position: "fixed", top: "50%", right: "20px", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: "4px", zIndex: 50 }}>
      {items.map((s) => {
        const isR = revealed.has(s.id)
        const isA = active === s.id
        return (
          <button 
            key={s.id} 
            onClick={() => isR && onNav(s.id)} 
            style={{ 
              display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end", 
              background: "none", border: "none", cursor: isR ? "pointer" : "default", 
              padding: "6px 0", fontFamily: "'DM Sans', sans-serif", 
              opacity: isR ? 1 : 0.15, transition: "all 0.3s ease" 
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: isA ? 500 : 300, color: isA ? "#E8614D" : "rgba(61,46,41,0.4)", opacity: isA ? 1 : 0, transform: isA ? "translateX(0)" : "translateX(4px)", transition: "all 0.3s ease", whiteSpace: "nowrap" }}>{s.label}</span>
            <div style={{ width: isA ? "20px" : "8px", height: "3px", borderRadius: "2px", background: isA ? "#E8614D" : "rgba(61,46,41,0.12)", transition: "all 0.3s ease" }} />
          </button>
        )
      })}
    </div>
  )
}

export default function ResultsPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const {
    answers,
    fullAnalysis,
    setFullAnalysis,
    setAnalysisLoading,
    completedPillars,
    resetAll,
  } = useIkigaiStore()
  
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [retryCountdown, setRetryCountdown] = useState(0)
  const hasFetchedRef = useRef(false)
  
  // UI State
  const [revealed, setRevealed] = useState(new Set(["statement"]))
  const [active, setActive] = useState("statement")
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null)
  const [activeIntersection, setActiveIntersection] = useState("passion")
  const [checkedActions, setCheckedActions] = useState(new Set<number>())
  const [stmtVisible, setStmtVisible] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
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
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
        hasFetchedRef.current = false
      } finally {
        setAnalysisLoading(false)
      }
    }
    
    fetchAnalysis()
  }, [mounted, fullAnalysis])
  
  // Reveal animation sequence
  useEffect(() => {
    if (!fullAnalysis) return
    setTimeout(() => setStmtVisible(true), 600)
    setTimeout(() => setRevealed(p => new Set([...p, "chart"])), 1800)
    setTimeout(() => setRevealed(p => new Set([...p, "intersections"])), 2400)
    setTimeout(() => setRevealed(p => new Set([...p, "paths"])), 3000)
    setTimeout(() => setRevealed(p => new Set([...p, "actions"])), 3500)
  }, [fullAnalysis])
  
  // Section observer
  useEffect(() => {
    if (!fullAnalysis) return
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => { 
        if (e.isIntersecting && e.target.getAttribute('data-section')) {
          setActive(e.target.getAttribute('data-section') || 'statement')
        }
      }), 
      { threshold: 0.3 }
    )
    setTimeout(() => {
      document.querySelectorAll("[data-section]").forEach((el) => obs.observe(el))
    }, 100)
    return () => obs.disconnect()
  }, [fullAnalysis])
  
  // Retry countdown
  useEffect(() => {
    if (retryCountdown <= 0) return
    const timer = setInterval(() => {
      setRetryCountdown(prev => prev <= 1 ? 0 : prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [retryCountdown])
  
  const handleRetry = () => {
    setIsRateLimited(false)
    setError(null)
    hasFetchedRef.current = false
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
        await navigator.share({ title: 'My Ikigai', text, url: window.location.href })
      } catch {
        await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
        alert('Copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`)
      alert('Copied to clipboard!')
    }
  }
  
  function navTo(id: string) {
    document.querySelector(`[data-section="${id}"]`)?.scrollIntoView({ behavior: "smooth" })
  }
  
  // Build pillar data with AI-generated scores
  const pillarData = fullAnalysis?.pillars.map((p, i) => ({
    ...p,
    ...PILLAR_CONFIG[i],
    score: p.clarityScore || 7,
    potential: p.potentialScore || 9,
  })) || []
  
  const hoveredData = hoveredPillar ? pillarData.find(p => p.id === hoveredPillar) : null
  
  // Loading spinner
  const Spinner = () => (
    <>
      <div style={{
        width: '48px', height: '48px', borderRadius: '50%',
        border: '4px solid rgba(232,97,77,0.2)', borderTopColor: '#E8614D',
        animation: 'spin 1s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
  
  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)' }}>
        <Spinner />
      </div>
    )
  }
  
  if (completedPillars.length === 0 && !fullAnalysis) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)' }}>
        <Spinner />
      </div>
    )
  }
  
  // Loading state
  if (!fullAnalysis) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)', fontFamily: "'DM Sans', sans-serif" }}>
        {isRateLimited ? (
          <div style={{ padding: '32px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: '16px', textAlign: 'center', maxWidth: '360px' }}>
            <p style={{ fontWeight: 500, color: '#3D2E29', marginBottom: '8px' }}>AI Service Busy</p>
            <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.55)', marginBottom: '20px' }}>Please wait and try again.</p>
            {retryCountdown > 0 ? (
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#E8614D', fontFamily: 'monospace' }}>{retryCountdown}s</p>
            ) : (
              <button onClick={handleRetry} style={{ padding: '12px 24px', background: '#E8614D', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Try Again</button>
            )}
          </div>
        ) : error ? (
          <div style={{ padding: '32px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', borderRadius: '16px', textAlign: 'center', maxWidth: '360px' }}>
            <p style={{ fontWeight: 500, color: '#DC2626', marginBottom: '8px' }}>Could not generate your results</p>
            <p style={{ fontSize: '14px', color: 'rgba(61,46,41,0.55)', marginBottom: '20px' }}>{error}</p>
            <button onClick={handleRetry} style={{ padding: '12px 24px', background: '#E8614D', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Try Again</button>
          </div>
        ) : (
          <>
            <Spinner />
            <p style={{ marginTop: '20px', fontSize: '17px', fontWeight: 500, color: '#3D2E29' }}>{t('results.synthesizing')}</p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(61,46,41,0.55)' }}>{t('results.findingPatterns')}</p>
          </>
        )}
      </div>
    )
  }
  
  const pillarKeyMap: Record<string, string> = {
    'love': 'love', 'good-at': 'goodAt', 'world-needs': 'worldNeeds', 'paid-for': 'paidFor'
  }
  
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: "hidden" }}>
      <SideNav active={active} onNav={navTo} revealed={revealed} />

      {/* Header */}
      <header style={{ padding: "24px 40px", background: "linear-gradient(180deg, #F0DBC8 0%, #F0DBCB 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "900px", margin: "0 auto" }}>
          <a href={`/${locale}`} style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", color: "#3D2E29", letterSpacing: "0.08em", textDecoration: "none" }}>iKi</a>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleStartOver} style={{ padding: "8px 20px", background: "none", border: "1px solid rgba(61,46,41,0.1)", borderRadius: "10px", fontSize: "13px", color: "rgba(61,46,41,0.4)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Retake</button>
            <button onClick={handleShare} style={{ padding: "8px 20px", background: "#E8614D", border: "none", borderRadius: "10px", fontSize: "13px", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>Share</button>
          </div>
        </div>
      </header>

      {/* ═══ STATEMENT ═══ */}
      <section data-section="statement" style={{
        background: "linear-gradient(180deg, #F0DBCB 0%, #F2E0D0 100%)", padding: "80px 40px 60px",
        textAlign: "center", minHeight: "55vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "60%", height: "80%", borderRadius: "50%", background: "radial-gradient(circle, rgba(225,185,55,0.08) 0%, transparent 60%)", filter: "blur(40px)", pointerEvents: "none" }} />
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#E8614D", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 28px", opacity: stmtVisible ? 1 : 0, transition: "opacity 0.6s ease" }}>Your Ikigai</p>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: "clamp(1.5rem, 3.2vw, 2.4rem)",
          fontWeight: 400, fontStyle: "italic", color: "#3D2E29", lineHeight: 1.35, maxWidth: "640px",
          margin: "0", position: "relative",
          opacity: stmtVisible ? 1 : 0, transform: stmtVisible ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.8s cubic-bezier(0.4,0,0.2,1) 0.2s",
        }}>
          <span style={{ fontSize: "1.8em", color: "#E8614D", opacity: 0.25, lineHeight: 0, position: "relative", top: "10px" }}>"</span>
          {fullAnalysis.ikigaiStatement}
          <span style={{ fontSize: "1.8em", color: "#E8614D", opacity: 0.25, lineHeight: 0, position: "relative", top: "10px" }}>"</span>
        </h1>
      </section>

      {/* ═══ RADAR + DETAIL ═══ */}
      <section data-section="chart" style={{
        background: "linear-gradient(180deg, #F2E0D0 0%, #F5E8DA 100%)", padding: "60px 40px",
        opacity: revealed.has("chart") ? 1 : 0, transform: revealed.has("chart") ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8614D", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>Your Ikigai Radar</p>
          <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.4)", fontWeight: 300, margin: "0 0 32px" }}>How clear each pillar is — hover to explore</p>

          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "40px", alignItems: "start" }}>
            <div style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "20px", padding: "24px 16px 16px" }}>
              <RadarChart 
                pillars={pillarData.map(p => ({ id: p.id, score: p.score, potential: p.potential }))} 
                hoveredPillar={hoveredPillar} 
                onHover={setHoveredPillar} 
                onLeave={() => setHoveredPillar(null)} 
              />
              <div style={{ display: "flex", justifyContent: "center", gap: "24px", paddingTop: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "16px", height: "3px", borderRadius: "2px", background: "#E8614D" }} />
                  <span style={{ fontSize: "11px", color: "rgba(61,46,41,0.4)", fontWeight: 300 }}>Current Clarity</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "16px", height: "0", borderTop: "1.5px dashed rgba(196,154,48,0.5)" }} />
                  <span style={{ fontSize: "11px", color: "rgba(61,46,41,0.4)", fontWeight: 300 }}>Potential</span>
                </div>
              </div>
            </div>

            {/* Detail panel */}
            <div style={{ minHeight: "340px" }}>
              {hoveredData ? (
                <div key={hoveredData.id} style={{ animation: "fadeSlide 0.25s ease-out both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${hoveredData.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600, color: hoveredData.color }}>{hoveredData.num}</div>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 500, color: "#3D2E29", margin: 0 }}>{hoveredData.label}</h3>
                      <span style={{ fontSize: "13px", color: hoveredData.color }}>{hoveredData.score.toFixed(1)}/10 clarity</span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "rgba(0,0,0,0.04)", position: "relative" }}>
                      <div style={{ width: `${hoveredData.potential * 10}%`, height: "100%", borderRadius: "3px", background: "rgba(196,154,48,0.12)", position: "absolute" }} />
                      <div style={{ width: `${hoveredData.score * 10}%`, height: "100%", borderRadius: "3px", background: hoveredData.color, position: "relative", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px" }}>
                    {hoveredData.keywords?.map((t, i) => <span key={i} style={{ fontSize: "12px", color: hoveredData.color, background: `${hoveredData.color}08`, padding: "4px 12px", borderRadius: "8px" }}>{t}</span>)}
                  </div>
                  <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "15px", color: "rgba(61,46,41,0.65)", lineHeight: 1.65, margin: 0 }}>{hoveredData.summary}</p>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center" }}>
                  <div>
                    <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "rgba(61,46,41,0.12)", fontStyle: "italic", margin: "0 0 8px" }}>Hover a pillar to explore</p>
                    <p style={{ fontSize: "13px", color: "rgba(61,46,41,0.15)", fontWeight: 300 }}>The gap between solid and dashed shows room to grow</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INTERSECTIONS ═══ */}
      <section data-section="intersections" style={{
        background: "linear-gradient(180deg, #F5E8DA 0%, #FAF2EA 100%)", padding: "60px 40px",
        opacity: revealed.has("intersections") ? 1 : 0, transform: revealed.has("intersections") ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease 0.1s",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8614D", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>Where They Intersect</p>
          <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.4)", fontWeight: 300, margin: "0 0 24px" }}>The sweet spots where your pillars overlap</p>
          <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
            {fullAnalysis.intersections.map((inter) => {
              const isA = activeIntersection === inter.id
              return (
                <button 
                  key={inter.id} 
                  onClick={() => setActiveIntersection(inter.id)} 
                  style={{ 
                    flex: 1, padding: "12px 8px", borderRadius: "12px", border: "none", cursor: "pointer", 
                    background: isA ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)", 
                    boxShadow: isA ? "0 2px 12px rgba(0,0,0,0.04)" : "none", 
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.25s ease", textAlign: "center" 
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: isA ? 500 : 400, color: isA ? "#3D2E29" : "rgba(61,46,41,0.35)" }}>
                    {inter.id === 'passion' ? 'Passion' : inter.id === 'mission' ? 'Mission' : inter.id === 'profession' ? 'Profession' : 'Vocation'}
                  </span>
                </button>
              )
            })}
          </div>
          {(() => {
            const inter = fullAnalysis.intersections.find(i => i.id === activeIntersection)
            if (!inter) return null
            const titles: Record<string, { title: string; subtitle: string }> = {
              passion: { title: 'Your Passion', subtitle: 'Where love meets ability' },
              mission: { title: 'Your Mission', subtitle: 'Where love meets purpose' },
              profession: { title: 'Your Profession', subtitle: 'Where ability meets market' },
              vocation: { title: 'Your Vocation', subtitle: 'Where purpose meets market' },
            }
            const info = titles[inter.id] || { title: inter.id, subtitle: '' }
            return (
              <div key={inter.id} style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.6)", borderRadius: "18px", padding: "32px", animation: "fadeSlide 0.25s ease-out both" }}>
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "22px", fontWeight: 400, color: "#3D2E29", margin: "0 0 4px" }}>{info.title}</h3>
                <p style={{ fontSize: "13px", color: "#E8614D", fontStyle: "italic", margin: "0 0 16px" }}>{info.subtitle}</p>
                <p style={{ fontSize: "15px", color: "rgba(61,46,41,0.6)", fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{inter.description}</p>
              </div>
            )
          })()}
        </div>
      </section>

      {/* ═══ PATHS ═══ */}
      <section data-section="paths" style={{
        background: "linear-gradient(180deg, #FAF2EA 0%, #FBF5EF 100%)", padding: "60px 40px",
        opacity: revealed.has("paths") ? 1 : 0, transform: revealed.has("paths") ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease 0.15s",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8614D", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>Paths Worth Exploring</p>
          <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.4)", fontWeight: 300, margin: "0 0 24px" }}>Career directions aligned with your Ikigai</p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {fullAnalysis.careerPaths?.map((path, i) => (
              <div 
                key={i} 
                style={{ 
                  flex: "1 1 280px", padding: "24px", background: "rgba(255,255,255,0.5)", 
                  backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.6)", 
                  borderRadius: "16px", transition: "all 0.3s ease", cursor: "pointer" 
                }}
              >
                <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", fontWeight: 400, color: "#3D2E29", margin: "0 0 8px", lineHeight: 1.3 }}>{path.title}</h3>
                <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.5)", fontWeight: 300, lineHeight: 1.5, margin: "0 0 12px" }}>{path.matchReason}</p>
                <p style={{ fontSize: "13px", color: "#E8614D", fontWeight: 500, margin: 0 }}>First step: {path.firstStep}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ACTIONS ═══ */}
      <section data-section="actions" style={{
        background: "linear-gradient(180deg, #FBF5EF 0%, #FDF8F4 100%)", padding: "60px 40px 40px",
        opacity: revealed.has("actions") ? 1 : 0, transform: revealed.has("actions") ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s ease 0.2s",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#E8614D", letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 8px" }}>What to Do This Week</p>
          <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.4)", fontWeight: 300, margin: "0 0 24px" }}>Three experiments to test your Ikigai</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {fullAnalysis.weeklyActions?.map((a, i) => {
              const isC = checkedActions.has(i)
              return (
                <div 
                  key={i} 
                  onClick={() => { 
                    const n = new Set(checkedActions)
                    n.has(i) ? n.delete(i) : n.add(i)
                    setCheckedActions(n)
                  }}
                  style={{ 
                    display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px 24px", 
                    background: isC ? "rgba(232,97,77,0.04)" : "rgba(255,255,255,0.45)", 
                    border: isC ? "1px solid rgba(232,97,77,0.12)" : "1px solid rgba(255,255,255,0.6)", 
                    borderRadius: "14px", cursor: "pointer", transition: "all 0.25s ease" 
                  }}
                >
                  <div style={{ 
                    width: "24px", height: "24px", borderRadius: "8px", 
                    border: isC ? "none" : "1.5px solid rgba(61,46,41,0.12)", 
                    background: isC ? "#E8614D" : "transparent", 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    flexShrink: 0, marginTop: "2px", transition: "all 0.2s ease" 
                  }}>
                    {isC && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7L6 10L11 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 500, color: "#3D2E29", margin: "0 0 4px", textDecoration: isC ? "line-through" : "none", opacity: isC ? 0.5 : 1, transition: "all 0.25s ease" }}>{a.title}</h4>
                    <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.45)", fontWeight: 300, lineHeight: 1.55, margin: 0, opacity: isC ? 0.4 : 1, transition: "opacity 0.25s ease" }}>{a.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Blind Spot */}
          {fullAnalysis.blindSpot && (
            <div style={{ marginTop: "28px", padding: "20px 24px", background: "rgba(225,185,55,0.06)", border: "1px solid rgba(225,185,55,0.1)", borderRadius: "14px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "18px", flexShrink: 0, marginTop: "2px" }}>💡</span>
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#C49A30", letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 6px" }}>Something to consider</p>
                <p style={{ fontSize: "14px", color: "rgba(61,46,41,0.5)", fontWeight: 300, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{fullAnalysis.blindSpot}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <div style={{ background: "#FDF8F4", padding: "40px 40px 60px", display: "flex", justifyContent: "center", gap: "12px" }}>
        <button onClick={handleShare} style={{ padding: "14px 40px", background: "#E8614D", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", boxShadow: "0 4px 20px rgba(232,97,77,0.25)" }}>Share Results</button>
        <button onClick={handleStartOver} style={{ padding: "14px 40px", background: "none", color: "rgba(61,46,41,0.4)", border: "1px solid rgba(61,46,41,0.1)", borderRadius: "14px", fontSize: "15px", fontWeight: 400, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>Start Over</button>
      </div>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
