'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSelector } from '@/components/shared/LanguageSelector'
import { useIkigaiStore } from '@/lib/store'

const PILLAR_DATA = [
  {
    id: 'love',
    labelKey: 'love',
    cx: 0, cy: -105,
    labelX: 0, labelY1: -152, labelY2: -140,
    line1: 'WHAT YOU', line2: 'LOVE',
    subtitle: 'Passion & Joy',
    desc: 'The activities that make you lose track of time. Topics you could discuss for hours. What you\'d do even if nobody was watching.',
  },
  {
    id: 'good-at',
    labelKey: 'goodAt',
    cx: -80, cy: 0,
    labelX: -135, labelY1: -3, labelY2: 9,
    line1: 'WHAT YOU\'RE', line2: 'GOOD AT',
    subtitle: 'Talent & Mastery',
    desc: 'Your natural strengths and learned skills. What others always ask for your help with. The things that come easily to you but seem hard for others.',
  },
  {
    id: 'world-needs',
    labelKey: 'worldNeeds',
    cx: 80, cy: 0,
    labelX: 135, labelY1: -3, labelY2: 9,
    line1: 'WHAT THE WORLD', line2: 'NEEDS',
    subtitle: 'Purpose & Impact',
    desc: 'The problems that keep you up at night. Changes you wish existed in the world. Where you feel called to contribute something meaningful.',
  },
  {
    id: 'paid-for',
    labelKey: 'paidFor',
    cx: 0, cy: 105,
    labelX: 0, labelY1: 152, labelY2: 164,
    line1: 'WHAT YOU CAN BE', line2: 'PAID FOR',
    subtitle: 'Value & Livelihood',
    desc: 'Where your abilities meet market demand. Skills people will pay for. The overlap between what you offer and what the world values economically.',
  },
]

type PillarId = 'love' | 'good-at' | 'world-needs' | 'paid-for'

function DiagramSVG({ 
  hoveredPillar, 
  onHover, 
  onLeave,
  onPillarClick 
}: { 
  hoveredPillar: PillarId | null
  onHover: (id: PillarId) => void
  onLeave: () => void
  onPillarClick: (id: PillarId) => void
}) {
  return (
    <svg viewBox="-250 -250 500 500" className="w-full h-full relative z-[2]">
      {/* Circles */}
      {PILLAR_DATA.map((p) => {
        const isHovered = hoveredPillar === p.id
        const isOtherHovered = hoveredPillar && hoveredPillar !== p.id
        return (
          <g key={p.id}>
            <circle
              cx={p.cx} cy={p.cy} r={130}
              fill={isHovered ? 'rgba(232,97,77,0.04)' : 'none'}
              stroke={isHovered ? 'rgba(232,97,77,0.3)' : 'rgba(61,46,41,0.13)'}
              strokeWidth={isHovered ? 1.5 : 1}
              className="cursor-pointer"
              style={{
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isOtherHovered ? 0.4 : 1,
              }}
              onMouseEnter={() => onHover(p.id as PillarId)}
              onMouseLeave={onLeave}
              onClick={() => onPillarClick(p.id as PillarId)}
            />
            {/* Invisible larger hit area */}
            <circle
              cx={p.cx} cy={p.cy} r={130}
              fill="transparent"
              stroke="transparent"
              strokeWidth={20}
              className="cursor-pointer"
              onMouseEnter={() => onHover(p.id as PillarId)}
              onMouseLeave={onLeave}
              onClick={() => onPillarClick(p.id as PillarId)}
            />
          </g>
        )
      })}

      {/* Intersection zone fills */}
      <circle cx={-46} cy={-55} r={30} fill="rgba(196,154,48,0.05)" stroke="none" />
      <circle cx={46} cy={-55} r={30} fill="rgba(196,154,48,0.05)" stroke="none" />
      <circle cx={-46} cy={55} r={30} fill="rgba(196,154,48,0.05)" stroke="none" />
      <circle cx={46} cy={55} r={30} fill="rgba(196,154,48,0.05)" stroke="none" />
      <circle cx={0} cy={0} r={36} fill="rgba(196,154,48,0.07)" stroke="none" />

      {/* Outer labels */}
      {PILLAR_DATA.map((p) => {
        const isHovered = hoveredPillar === p.id
        const isOtherHovered = hoveredPillar && hoveredPillar !== p.id
        return (
          <g key={`label-${p.id}`} style={{ transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: isOtherHovered ? 0.3 : 1 }}>
            <text 
              x={p.labelX} 
              y={p.labelY1} 
              textAnchor="middle" 
              style={{ 
                fontFamily: "'DM Sans',sans-serif", 
                fontSize: '9px', 
                fontWeight: 300, 
                letterSpacing: '0.07em', 
                fill: isHovered ? '#E8614D' : 'rgba(61,46,41,0.55)', 
                transition: 'fill 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              {p.line1}
            </text>
            <text 
              x={p.labelX} 
              y={p.labelY2} 
              textAnchor="middle" 
              style={{ 
                fontFamily: "'DM Sans',sans-serif", 
                fontSize: '9px', 
                fontWeight: 500, 
                letterSpacing: '0.07em', 
                fill: isHovered ? '#E8614D' : '#3D2E29', 
                transition: 'fill 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              {p.line2}
            </text>
          </g>
        )
      })}

      {/* Intersection labels */}
      {[
        { label: 'PASSION', x: -46, y: -58 },
        { label: 'MISSION', x: 46, y: -58 },
        { label: 'PROFESSION', x: -46, y: 63 },
        { label: 'VOCATION', x: 46, y: 63 },
      ].map((inter, i) => (
        <text 
          key={i} 
          x={inter.x} 
          y={inter.y} 
          textAnchor="middle"
          style={{ 
            fontFamily: "'DM Sans',sans-serif", 
            fontSize: '9px', 
            fontWeight: 500, 
            letterSpacing: '0.1em', 
            fill: '#C49A30', 
            opacity: hoveredPillar ? 0.3 : 1, 
            transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
        >
          {inter.label}
        </text>
      ))}

      {/* Center */}
      <text 
        x={0} 
        y={4} 
        textAnchor="middle"
        style={{ 
          fontFamily: "'Instrument Serif',serif", 
          fontSize: '16px', 
          fontWeight: 400, 
          letterSpacing: '0.06em', 
          fill: '#3D2E29', 
          opacity: hoveredPillar ? 0.3 : 1, 
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        IKIGAI
      </text>
    </svg>
  )
}

// Grain texture component
function GrainOverlay({ opacity = 0.35 }: { opacity?: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ 
        opacity, 
        mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px'
      }}
    />
  )
}

// Scrolling Marquee Band component
function MarqueeBand({ 
  items, 
  accentWords, 
  reverse = false,
  duration = 35 
}: { 
  items: string[]
  accentWords: string[]
  reverse?: boolean
  duration?: number
}) {
  const isAccent = (text: string) => accentWords.includes(text)
  
  // Create the content strip
  const ContentStrip = () => (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          {isAccent(item) ? (
            <span 
              style={{ 
                fontFamily: "'Instrument Serif', serif",
                fontSize: '22px',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '0.02em',
                color: '#E8614D'
              }}
            >
              {item}
            </span>
          ) : (
            <span 
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '18px',
                fontWeight: 300,
                letterSpacing: '0.03em',
                color: 'rgba(232,97,77,0.45)'
              }}
            >
              {item}
            </span>
          )}
          <span 
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 300,
              color: 'rgba(232,97,77,0.2)',
              padding: '0 16px'
            }}
          >
            /
          </span>
        </span>
      ))}
    </>
  )

  return (
    <div 
      className="overflow-hidden"
      style={{ 
        background: '#E8D5C4',
        padding: '18px 0'
      }}
    >
      <div 
        className="flex"
        style={{
          animation: `marquee${reverse ? 'Reverse' : ''} ${duration}s linear infinite`,
          width: 'fit-content'
        }}
      >
        {/* Duplicate content 4 times for seamless loop */}
        <div className="flex">
          <ContentStrip />
          <ContentStrip />
          <ContentStrip />
          <ContentStrip />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const { setCurrentPillar } = useIkigaiStore()

  const [loaded, setLoaded] = useState(false)
  const [hoveredPillar, setHoveredPillar] = useState<PillarId | null>(null)
  const [mounted, setMounted] = useState(false)
  const [currentSection, setCurrentSection] = useState('hero')
  const [expandedPillar, setExpandedPillar] = useState<PillarId | null>(null)

  // Section background colors (one shade darker for navbar)
  // Page goes: dark warm (#F0DBC8) → light cream (#FFFBF9)
  // Navbar follows same progression, each slightly darker than section
  const navbarColors: Record<string, string> = {
    hero: '#E5CDB8',      // darker than #F0DBC8
    how: '#E8D0BD',       // darker than #F0DBCB  
    pillars: '#EBDCCC',   // darker than #F5E8DA
    results: '#F0E6DC',   // darker than #FAF2EA
    cta: '#F5EDE6',       // darker than #FDF8F4
    footer: '#F8F2ED'     // darker than #FFFBF9
  }

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setLoaded(true), 300)
  }, [])

  // Track which section is currently visible
  useEffect(() => {
    const sections = document.querySelectorAll('[data-nav-section]')
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const section = entry.target.getAttribute('data-nav-section')
            if (section) setCurrentSection(section)
          }
        })
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: '-80px 0px 0px 0px' }
    )
    
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [mounted])

  const hoveredData = hoveredPillar ? PILLAR_DATA.find(p => p.id === hoveredPillar) : null

  const handleStartJourney = () => {
    setCurrentPillar('love')
    router.push(`/${locale}/questions`)
  }

  const handlePillarClick = (pillarId: PillarId) => {
    setCurrentPillar(pillarId)
    router.push(`/${locale}/questions`)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#F0DBC8] flex items-center justify-center">
        <div className="animate-pulse font-serif text-2xl text-[#3D2E29]/30">iKi</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO
          Background: #F0DBC8 → #F0DBCB
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        data-nav-section="hero"
        className="relative min-h-screen overflow-hidden pt-16"
        style={{ background: 'linear-gradient(180deg, #F0DBC8 0%, #F0DBCB 100%)' }}
      >
        <GrainOverlay opacity={0.35} />

        {/* Warm atmospheric orbs */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[55%] h-[65%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,97,77,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <div 
          className="absolute -bottom-[20%] -right-[8%] w-[45%] h-[55%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,154,48,0.12) 0%, transparent 55%)', filter: 'blur(70px)' }}
        />
        <div 
          className="absolute top-[40%] left-[25%] w-[30%] h-[35%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,160,80,0.08) 0%, transparent 60%)', filter: 'blur(50px)' }}
        />

        {/* Edge shading */}
        <div 
          className="absolute top-0 left-0 right-0 h-[100px] pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(61,46,41,0.05) 0%, transparent 100%)' }}
        />

        {/* Nav - Fixed with dynamic background */}
        <nav 
          className="fixed top-0 left-0 right-0 px-6 md:px-12 py-4 flex justify-between items-center z-50"
          style={{ 
            backgroundColor: navbarColors[currentSection] || navbarColors.hero,
            transition: 'background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[24px] text-[#3D2E29] tracking-wider">iKi</span>
          <div className="flex gap-4 md:gap-8 items-center">
            <a href="#how" className="hidden md:block text-[13px] text-[#3D2E29]/55 hover:text-[#3D2E29] transition-colors">
              How It Works
            </a>
            <a href="#pillars" className="hidden md:block text-[13px] text-[#3D2E29]/55 hover:text-[#3D2E29] transition-colors">
              The Pillars
            </a>
            <LanguageSelector />
            <button
              onClick={handleStartJourney}
              className="px-6 py-2.5 bg-[#E8614D] text-white rounded-[14px] text-[13px] font-medium shadow-[0_2px_16px_rgba(232,97,77,0.25)] hover:shadow-[0_4px_24px_rgba(232,97,77,0.35)] hover:-translate-y-0.5 transition-all"
              style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {t('landing.beginJourney')}
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 py-10 lg:py-16 relative z-[5] min-h-[calc(100vh-120px)]">
          {/* Left copy */}
          <div 
            className="order-1 lg:order-1 lg:pl-4"
            style={{ 
              opacity: loaded ? 1 : 0, 
              transform: loaded ? 'translateY(0)' : 'translateY(16px)', 
              transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.2s' 
            }}
          >
            <p className="text-[12px] font-medium text-[#E8614D] tracking-[0.18em] uppercase mb-5">
              Find Your Purpose
            </p>
            <h1 
              className="font-normal italic text-[#3D2E29] leading-[1.05] mb-7"
              style={{ 
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)',
                letterSpacing: '-0.02em'
              }}
            >
              {t('landing.tagline')}
            </h1>
            <p className="text-[18px] leading-[1.7] text-[#3D2E29]/60 font-light mb-10 max-w-[440px]">
              {t('landing.description')}
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <button
                onClick={handleStartJourney}
                className="px-11 py-4 bg-[#E8614D] text-white rounded-[14px] text-[16px] font-medium shadow-[0_4px_24px_rgba(232,97,77,0.3)] hover:shadow-[0_8px_32px_rgba(232,97,77,0.35)] hover:-translate-y-0.5 transition-all"
                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
              >
                {t('landing.beginJourney')}
              </button>
            </div>
          </div>

          {/* Right: Diagram with contained light zone */}
          <div 
            className="relative max-w-[380px] lg:max-w-[440px] mx-auto w-full order-2 lg:order-2"
            style={{ 
              opacity: loaded ? 1 : 0, 
              transform: loaded ? 'scale(1)' : 'scale(0.92)', 
              transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s' 
            }}
          >
            {/* Light clearing */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[105%] rounded-full pointer-events-none z-[1]"
              style={{ background: 'radial-gradient(circle, rgba(255,253,248,0.7) 0%, rgba(255,253,248,0.5) 30%, rgba(255,250,242,0.25) 55%, transparent 72%)' }}
            />

            {/* Golden glow layers */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full pointer-events-none z-[1]"
              style={{ background: 'radial-gradient(circle, rgba(218,175,70,0.16) 0%, rgba(218,175,70,0.05) 35%, transparent 55%)', filter: 'blur(25px)' }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full pointer-events-none z-[1]"
              style={{ background: 'radial-gradient(circle, rgba(225,185,55,0.3) 0%, rgba(225,185,55,0.08) 40%, transparent 60%)', filter: 'blur(18px)' }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[38%] h-[38%] rounded-full pointer-events-none z-[1]"
              style={{ background: 'radial-gradient(circle, rgba(230,190,45,0.4) 0%, rgba(230,190,45,0.12) 50%, transparent 70%)', filter: 'blur(12px)' }}
            />

            {/* Diagram */}
            <div className="relative w-full aspect-square z-[2]">
              <DiagramSVG
                hoveredPillar={hoveredPillar}
                onHover={setHoveredPillar}
                onLeave={() => setHoveredPillar(null)}
                onPillarClick={handlePillarClick}
              />
            </div>

            {/* Hint */}
            <p 
              className="text-center text-[12px] text-[#3D2E29]/35 font-light italic mt-1"
              style={{ 
                opacity: hoveredPillar ? 0 : 1,
                transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Hover each circle to explore
            </p>
          </div>

          {/* Tooltip - positioned outside on the right side */}
          <div 
            className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 w-[260px] z-30 pointer-events-none"
            style={{ 
              opacity: hoveredData ? 1 : 0,
              transform: hoveredData ? 'translateX(0)' : 'translateX(20px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {hoveredData && (
              <div className="bg-white/[0.92] backdrop-blur-xl border border-black/[0.06] rounded-[14px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <p style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[16px] font-normal text-[#3D2E29] mb-1">
                  {t(`pillars.${hoveredData.labelKey}.title`)}
                </p>
                <p className="text-[11px] font-medium text-[#E8614D] tracking-wide mb-3">
                  {hoveredData.subtitle}
                </p>
                <p className="text-[13px] text-[#3D2E29]/55 font-light leading-relaxed italic">
                  {hoveredData.desc}
                </p>
                <div className="mt-4 pt-3 border-t border-black/[0.05]">
                  <p className="text-[11px] text-[#3D2E29]/35 font-light">
                    Click to start with this pillar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile tooltip */}
          {hoveredData && (
            <div className="lg:hidden order-3 mt-4 animate-tooltip-in">
              <div className="bg-white/[0.92] backdrop-blur-xl border border-black/[0.06] rounded-[14px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <p style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[16px] font-normal text-[#3D2E29] mb-1">
                  {t(`pillars.${hoveredData.labelKey}.title`)}
                </p>
                <p className="text-[11px] font-medium text-[#E8614D] tracking-wide mb-2">
                  {hoveredData.subtitle}
                </p>
                <p className="text-[13px] text-[#3D2E29]/55 font-light leading-relaxed">
                  {hoveredData.desc}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MARQUEE BAND 1: Hero → How It Works
      ═══════════════════════════════════════════════════════════════════ */}
      <MarqueeBand 
        items={['Find your reason for being', '生き甲斐', 'Where passion meets purpose', 'Ikigai', 'The life worth living', 'Your intersection']}
        accentWords={['生き甲斐', 'Ikigai', 'Your intersection']}
        duration={35}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: HOW IT WORKS
          Background: #F0DBCB → #F5E8DA
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        id="how"
        data-nav-section="how"
        className="relative px-6 md:px-10 py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg, #F0DBCB 0%, #F5E8DA 100%)' }}
      >
        <GrainOverlay opacity={0.25} />
        <div className="max-w-[960px] mx-auto relative z-[1]">
          <div className="text-center mb-12 md:mb-14">
            <p className="text-[11px] font-medium text-[#E8614D] tracking-[0.14em] uppercase mb-4">
              How It Works
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[1.8rem] md:text-[2.6rem] font-normal text-[#3D2E29] leading-tight">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Reflect',
                desc: 'Answer guided questions across four dimensions of Ikigai. Write freely — there are no right answers, only honest ones.',
                detail: '~15 minutes',
              },
              {
                step: '02',
                title: 'Discover',
                desc: 'AI synthesizes your responses into patterns, themes, and connections you might not have seen yourself.',
                detail: 'Instant results',
              },
              {
                step: '03',
                title: 'Act',
                desc: 'Get a personalized Ikigai statement, deep pillar insights, and concrete next steps to try this week.',
                detail: 'Save & revisit',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <span 
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                  className="text-[64px] font-normal text-[#E8614D]/[0.08] leading-none block -mb-3"
                >
                  {item.step}
                </span>
                <h3 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[22px] font-normal text-[#3D2E29] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-[14px] text-[#3D2E29]/55 font-light leading-relaxed mb-3">
                  {item.desc}
                </p>
                <span className="text-[12px] text-[#E8614D] font-normal bg-[#E8614D]/[0.08] px-2.5 py-1 rounded-md">
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: FOUR PILLARS
          Background: #F5E8DA → #FAF2EA
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        id="pillars"
        data-nav-section="pillars"
        className="relative px-6 md:px-10 py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg, #F5E8DA 0%, #FAF2EA 100%)' }}
      >
        <GrainOverlay opacity={0.2} />
        <div className="max-w-[960px] mx-auto relative z-[1]">
          <div className="text-center mb-12">
            <p className="text-[11px] font-medium text-[#E8614D] tracking-[0.14em] uppercase mb-4">
              The Four Pillars
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[1.8rem] md:text-[2.6rem] font-normal text-[#3D2E29] leading-tight">
              What you&apos;ll explore
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                num: '01',
                titleKey: 'love',
                pillarId: 'love' as PillarId,
                subtitle: 'Passion & Joy',
                desc: 'Explore the activities, topics, and moments that make you lose track of time.',
                accent: '#E8614D',
                expandedDesc: 'What makes you feel alive? Think about the moments when time disappears — the things you do just because you enjoy them. Explore what excites you, energizes you, and naturally pulls your attention. This is where your real motivation lives.',
              },
              {
                num: '02',
                titleKey: 'goodAt',
                pillarId: 'good-at' as PillarId,
                subtitle: 'Talent & Mastery',
                desc: 'Identify your natural strengths and learned skills others recognize in you.',
                accent: '#D4784A',
                expandedDesc: 'Think about your strengths, skills, and abilities — the things you do well and keep improving over time. Explore the talents others recognize in you and the capabilities you\'ve developed.',
              },
              {
                num: '03',
                titleKey: 'worldNeeds',
                pillarId: 'world-needs' as PillarId,
                subtitle: 'Purpose & Impact',
                desc: 'Reflect on the problems that matter and the change you want to create.',
                accent: '#7BA05B',
                expandedDesc: 'What kind of change matters to you? Think about the problems you care about and the difference you want to make. Explore how your actions can help others and contribute to something bigger than yourself.',
              },
              {
                num: '04',
                titleKey: 'paidFor',
                pillarId: 'paid-for' as PillarId,
                subtitle: 'Value & Livelihood',
                desc: 'Connect your skills and passions to viable opportunities.',
                accent: '#5B8BA0',
                expandedDesc: 'Look at what the world is willing to value. Explore opportunities where your skills and interests can provide real impact and support your livelihood.',
              },
            ].map((card, i) => {
              const isExpanded = expandedPillar === card.pillarId
              return (
                <div
                  key={i}
                  className={`bg-white/50 backdrop-blur-sm rounded-[18px] p-8 md:p-9 border relative overflow-hidden cursor-pointer hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] ${isExpanded ? '' : 'hover:-translate-y-0.5 border-white'}`}
                  style={{ 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isExpanded ? `0 0 0 2px ${card.accent}` : undefined,
                    borderColor: isExpanded ? card.accent + '40' : undefined
                  }}
                  onClick={() => setExpandedPillar(isExpanded ? null : card.pillarId)}
                >
                  <span
                    style={{ fontFamily: "'Instrument Serif', serif", color: card.accent }}
                    className="absolute top-4 right-8 text-[110px] font-normal leading-none pointer-events-none opacity-[0.05]"
                  >
                    {card.num}
                  </span>
                  <div className="relative pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[11px] font-medium tracking-wider uppercase"
                        style={{ color: card.accent }}
                      >
                        {card.num}
                      </span>
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 -mr-5 ${isExpanded ? 'rotate-180' : ''}`}
                        style={{ color: card.accent }}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[22px] font-normal text-[#3D2E29] mt-2 mb-1 leading-tight">
                      {t(`pillars.${card.titleKey}.title`)}
                    </h3>
                    <p className="text-[13px] font-normal italic mb-3" style={{ color: card.accent }}>
                      {card.subtitle}
                    </p>
                    <p className="text-[14px] text-[#3D2E29]/55 font-light leading-relaxed">
                      {card.desc}
                    </p>
                    <div 
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{ 
                        maxHeight: isExpanded ? '200px' : '0px',
                        opacity: isExpanded ? 1 : 0,
                        marginTop: isExpanded ? '16px' : '0px'
                      }}
                    >
                      <div className="pt-4 border-t border-[#3D2E29]/10">
                        <p className="text-[14px] text-[#3D2E29]/70 font-light leading-relaxed">
                          {card.expandedDesc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MARQUEE BAND 2: Pillars → Results (reverse direction)
      ═══════════════════════════════════════════════════════════════════ */}
      <MarqueeBand 
        items={['What lights you up inside', 'Purpose', 'Skills others admire in you', 'Clarity', 'Problems you ache to solve', 'Direction']}
        accentWords={['Purpose', 'Clarity', 'Direction']}
        reverse={true}
        duration={30}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: YOUR RESULTS
          Background: #FAF2EA → #FDF8F4
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        data-nav-section="results"
        className="relative px-6 md:px-10 py-16 md:py-24"
        style={{ background: 'linear-gradient(180deg, #FAF2EA 0%, #FDF8F4 100%)' }}
      >
        <GrainOverlay opacity={0.15} />
        <div className="max-w-[900px] mx-auto relative z-[1]">
          <div className="text-center mb-12">
            <p className="text-[11px] font-medium text-[#E8614D] tracking-[0.14em] uppercase mb-4">
              Your Results
            </p>
            <h2 style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[1.8rem] md:text-[2.6rem] font-normal text-[#3D2E29] leading-tight mb-3">
              Not just answers — a mirror
            </h2>
            <p className="text-[16px] text-[#3D2E29]/55 font-light max-w-[480px] mx-auto leading-relaxed">
              AI reads between your lines to surface patterns, connections, and truths you might not have articulated yourself.
            </p>
          </div>

          {/* Result preview mockup */}
          <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[20px] p-8 md:p-12 max-w-[640px] mx-auto text-center shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
            <p className="text-[11px] font-medium text-[#E8614D] tracking-wider uppercase mb-5">
              Sample Ikigai Statement
            </p>
            <p 
              style={{ fontFamily: "'Instrument Serif', serif" }}
              className="text-[20px] md:text-[22px] font-normal italic text-[#3D2E29] leading-relaxed mb-8"
            >
              &ldquo;You come alive when you&apos;re building tools that help people think more clearly — combining your craft in software with your instinct for how humans actually behave.&rdquo;
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {['Pillar Insights', 'Intersection Map', 'Weekly Actions'].map((tag, i) => (
                <span
                  key={i}
                  className="text-[12px] text-[#3D2E29]/55 bg-black/[0.03] px-3.5 py-1.5 rounded-lg font-normal"
                >
                  + {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: FINAL CTA
          Background: #FDF8F4 → #FFFBF9
      ═══════════════════════════════════════════════════════════════════ */}
      <section 
        data-nav-section="cta"
        className="relative px-6 md:px-10 py-16 md:py-24 text-center"
        style={{ background: 'linear-gradient(180deg, #FDF8F4 0%, #FFFBF9 100%)' }}
      >
        <h2 
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-[2rem] md:text-[3rem] font-normal italic text-[#3D2E29] leading-tight mb-3"
        >
          Ready to find your reason for being?
        </h2>
        <button
          onClick={handleStartJourney}
          className="px-12 py-4 bg-[#E8614D] text-white rounded-[14px] text-[16px] font-medium shadow-[0_4px_24px_rgba(232,97,77,0.25)] hover:shadow-[0_8px_32px_rgba(232,97,77,0.3)] hover:-translate-y-0.5"
          style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {t('landing.beginJourney')}
        </button>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
          Background: #FFFBF9
      ═══════════════════════════════════════════════════════════════════ */}
      <footer 
        data-nav-section="footer"
        className="bg-[#FFFBF9] px-6 md:px-10 py-8 border-t border-black/[0.04] flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <span style={{ fontFamily: "'Instrument Serif', serif" }} className="text-[16px] text-[#3D2E29] opacity-40 tracking-wider">iKi</span>
        <p className="text-[12px] text-[#3D2E29]/35 font-light text-center">
          Built with care · Your data stays private
        </p>
      </footer>

    </div>
  )
}
