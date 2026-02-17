'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { useIkigaiStore, IkigaiSection, AnswerValue } from '@/lib/store'
import { getPillarById, Question } from '@/lib/questions'

const SECTIONS = [
  { id: 'love', label: 'Love', key: 'love' },
  { id: 'good-at', label: 'Skills', key: 'goodAt' },
  { id: 'world-needs', label: 'Needs', key: 'worldNeeds' },
  { id: 'paid-for', label: 'Paid', key: 'paidFor' },
]

// Wisdom quotes for each pillar
const WISDOM_QUOTES: Record<string, { quote: string; author: string }> = {
  'love': { quote: '"The only way to do great work is to love what you do."', author: 'Steve Jobs' },
  'good-at': { quote: '"Excellence is not a gift but a skill that takes practice."', author: 'Plato' },
  'world-needs': { quote: '"The best way to find yourself is to lose yourself in the service of others."', author: 'Gandhi' },
  'paid-for': { quote: '"Your work is going to fill a large part of your life."', author: 'Steve Jobs' },
}

function MultiSelectPills({ 
  options, 
  value, 
  onChange, 
  maxSelections = 5 
}: { 
  options: { id: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
  maxSelections?: number
}) {
  // Separate predefined selections from custom ones
  const predefinedSelections = value.filter(v => !v.startsWith('custom:'))
  const customSelections = value.filter(v => v.startsWith('custom:')).map(v => v.replace('custom:', ''))
  const [customInput, setCustomInput] = useState('')
  
  const totalSelected = predefinedSelections.length + customSelections.length
  const atMax = totalSelected >= maxSelections

  function toggle(id: string) {
    if (predefinedSelections.includes(id)) {
      onChange(value.filter(v => v !== id))
    } else if (!atMax) {
      onChange([...value, id])
    }
  }
  
  function addCustomOption() {
    const trimmed = customInput.trim()
    if (trimmed && !atMax && !customSelections.includes(trimmed)) {
      onChange([...value, `custom:${trimmed}`])
      setCustomInput('')
    }
  }
  
  function removeCustomOption(text: string) {
    onChange(value.filter(v => v !== `custom:${text}`))
  }

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '16px',
      }}>
        {options.map((option) => {
          const isSelected = predefinedSelections.includes(option.id)
          const isDisabled = atMax && !isSelected
          return (
            <button
              key={option.id}
              onClick={() => toggle(option.id)}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                border: isSelected
                  ? '1.5px solid #E8614D'
                  : '1px solid rgba(61,46,41,0.08)',
                background: isSelected
                  ? 'rgba(232,97,77,0.08)'
                  : 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(8px)',
                color: isSelected
                  ? '#E8614D'
                  : isDisabled
                    ? 'rgba(61,46,41,0.2)'
                    : 'rgba(61,46,41,0.6)',
                fontSize: '14px',
                fontWeight: isSelected ? 500 : 400,
                fontFamily: "'DM Sans', sans-serif",
                cursor: isDisabled ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                opacity: isDisabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '6px',
                border: isSelected ? 'none' : '1.5px solid rgba(61,46,41,0.12)',
                background: isSelected ? '#E8614D' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {option.label}
            </button>
          )
        })}
      </div>
      
      {/* Custom options display */}
      {customSelections.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '16px',
        }}>
          {customSelections.map((text) => (
            <span
              key={text}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '20px',
                background: 'rgba(232,97,77,0.12)',
                color: '#E8614D',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              {text}
              <button
                onClick={() => removeCustomOption(text)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8614D" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Add your own option */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustomOption()
            }
          }}
          placeholder="Add your own..."
          disabled={atMax}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(61,46,41,0.1)',
            background: atMax ? 'rgba(61,46,41,0.03)' : 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
            color: '#3D2E29',
            outline: 'none',
            opacity: atMax ? 0.5 : 1,
          }}
        />
        <button
          onClick={addCustomOption}
          disabled={atMax || !customInput.trim()}
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            border: 'none',
            background: (atMax || !customInput.trim()) ? 'rgba(61,46,41,0.1)' : '#E8614D',
            color: (atMax || !customInput.trim()) ? 'rgba(61,46,41,0.3)' : '#fff',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            cursor: (atMax || !customInput.trim()) ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Add
        </button>
      </div>

      {/* Selection counter */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 400,
          color: atMax ? '#E8614D' : 'rgba(61,46,41,0.35)',
          transition: 'color 0.3s ease',
        }}>
          {totalSelected} of {maxSelections} selected
          {atMax && (
            <span style={{
              marginLeft: '8px',
              fontSize: '12px',
              color: 'rgba(61,46,41,0.3)',
              fontWeight: 300,
            }}>
              — remove one to add another
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

function SpectrumSliderRefined({
  leftLabel,
  rightLabel,
  value,
  onChange,
}: {
  leftLabel: string
  rightLabel: string
  value: number
  onChange: (value: number) => void
}) {
  const sliderId = `slider-${Math.random().toString(36).substr(2, 9)}`
  const [isDragging, setIsDragging] = useState(false)
  
  // Determine which label to show based on value
  const getFeedbackText = () => {
    if (value < 30) return leftLabel
    if (value > 70) return rightLabel
    return 'Balanced'
  }
  
  // Determine highlight for labels
  const leftHighlight = value < 40
  const rightHighlight = value > 60
  
  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        fontSize: '13px',
        fontWeight: 300,
      }}>
        <span style={{
          color: leftHighlight ? '#E8614D' : 'rgba(61,46,41,0.55)',
          fontWeight: leftHighlight ? 500 : 300,
          transition: 'all 0.2s ease',
        }}>
          {leftLabel}
        </span>
        <span style={{
          color: rightHighlight ? '#E8614D' : 'rgba(61,46,41,0.55)',
          fontWeight: rightHighlight ? 500 : 300,
          transition: 'all 0.2s ease',
        }}>
          {rightLabel}
        </span>
      </div>
      
      {/* Slider container with tooltip */}
      <div style={{ position: 'relative' }}>
        {/* Floating feedback bubble */}
        <div style={{
          position: 'absolute',
          left: `${value}%`,
          transform: 'translateX(-50%)',
          bottom: '32px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: '#E8614D',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 0.15s ease',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(232,97,77,0.3)',
        }}>
          {getFeedbackText()}
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #E8614D',
          }} />
        </div>
        
        <style>{`
          #${sliderId}::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #E8614D;
            cursor: grab;
            border: 3px solid #fff;
            box-shadow: 0 2px 12px rgba(232,97,77,0.4);
            margin-top: -10px;
            transition: transform 0.1s ease, box-shadow 0.1s ease;
          }
          #${sliderId}::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(232,97,77,0.5);
          }
          #${sliderId}::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: #E8614D;
            cursor: grab;
            border: 3px solid #fff;
            box-shadow: 0 2px 12px rgba(232,97,77,0.4);
          }
          #${sliderId}::-moz-range-thumb:active {
            cursor: grabbing;
            transform: scale(1.1);
          }
          #${sliderId}::-webkit-slider-runnable-track {
            height: 8px;
            border-radius: 4px;
          }
          #${sliderId}::-moz-range-track {
            height: 8px;
            border-radius: 4px;
          }
        `}</style>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '4px',
            background: `linear-gradient(to right, #E8614D ${value}%, rgba(61,46,41,0.1) ${value}%)`,
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        />
      </div>
      
      {/* Current position indicator */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        fontSize: '12px',
        color: 'rgba(61,46,41,0.4)',
        fontWeight: 300,
      }}>
        {value < 40 ? `Leaning ${leftLabel.toLowerCase()}` : 
         value > 60 ? `Leaning ${rightLabel.toLowerCase()}` : 
         'Balanced between both'}
      </div>
    </div>
  )
}

function RankingList({
  items,
  value,
  onChange,
}: {
  items: { id: string; label: string }[]
  value: string[]
  onChange: (value: string[]) => void
}) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  
  // Items not yet ranked
  const unrankedItems = items.filter(item => !value.includes(item.id))
  // Items already ranked (in order)
  const rankedItems = value.map(id => items.find(item => item.id === id)).filter(Boolean) as { id: string; label: string }[]
  
  const handleAddToRanking = (id: string) => {
    if (!value.includes(id)) {
      onChange([...value, id])
    }
  }
  
  const handleRemoveFromRanking = (id: string) => {
    onChange(value.filter(v => v !== id))
  }
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = 'move'
  }
  
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || draggedItem === targetId) return
    
    const draggedIndex = value.indexOf(draggedItem)
    const targetIndex = value.indexOf(targetId)
    
    if (draggedIndex === -1 || targetIndex === -1) return
    
    const newValue = [...value]
    newValue.splice(draggedIndex, 1)
    newValue.splice(targetIndex, 0, draggedItem)
    onChange(newValue)
  }
  
  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div>
      {/* Ranked items */}
      {rankedItems.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(61,46,41,0.45)', marginBottom: '10px', fontWeight: 500 }}>
            Your ranking (drag to reorder):
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rankedItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: draggedItem === item.id 
                    ? 'rgba(232,97,77,0.15)' 
                    : 'rgba(232,97,77,0.08)',
                  border: '1.5px solid #E8614D',
                  cursor: 'grab',
                  transition: 'all 0.15s ease',
                  opacity: draggedItem === item.id ? 0.7 : 1,
                }}
              >
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#E8614D',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {index + 1}
                </span>
                <span style={{ flex: 1, fontSize: '14px', color: '#E8614D', fontWeight: 500 }}>
                  {item.label}
                </span>
                <button
                  onClick={() => handleRemoveFromRanking(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    opacity: 0.6,
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8614D" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8614D" strokeWidth="2" style={{ opacity: 0.4 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Unranked items to choose from */}
      {unrankedItems.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', color: 'rgba(61,46,41,0.45)', marginBottom: '10px', fontWeight: 500 }}>
            {rankedItems.length > 0 ? 'Tap to add:' : 'Tap to start ranking:'}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {unrankedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAddToRanking(item.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(61,46,41,0.08)',
                  background: 'rgba(255,255,255,0.45)',
                  backdropFilter: 'blur(8px)',
                  color: 'rgba(61,46,41,0.6)',
                  fontSize: '14px',
                  fontWeight: 400,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Status */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 400,
          color: rankedItems.length === items.length ? '#E8614D' : 'rgba(61,46,41,0.35)',
        }}>
          {rankedItems.length} of {items.length} ranked
          {rankedItems.length === items.length && (
            <span style={{ marginLeft: '8px', fontSize: '12px', color: 'rgba(61,46,41,0.3)', fontWeight: 300 }}>
              — drag to reorder
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

function ShortTextRefined({
  value,
  onChange,
  placeholder,
  maxLength = 200,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}) {
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid rgba(61,46,41,0.1)',
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
          fontSize: '15px',
          fontFamily: "'DM Sans', sans-serif",
          color: '#3D2E29',
          resize: 'vertical',
          outline: 'none',
        }}
      />
      <div style={{
        textAlign: 'right',
        marginTop: '8px',
        fontSize: '12px',
        color: 'rgba(61,46,41,0.3)',
      }}>
        {value.length}/{maxLength}
      </div>
    </div>
  )
}

function QuestionRenderer({ 
  question, 
  value, 
  onChange,
  t,
  pillarKey
}: { 
  question: Question
  value: AnswerValue | undefined
  onChange: (value: AnswerValue) => void
  t: ReturnType<typeof useTranslations>
  pillarKey: string
}) {
  const questionKey = question.id.replace(`${pillarKey}-`, '').replace(/-/g, '')
  const baseKey = `questions.${pillarKey}.${questionKey === 'freetext' ? 'freetext' : questionKey}`
  
  switch (question.type) {
    case 'multi-select': {
      const translatedOptions = question.options.map(opt => ({
        ...opt,
        label: t.has(`${baseKey}.options.${opt.id}`) 
          ? t(`${baseKey}.options.${opt.id}`) 
          : opt.label
      }))
      return (
        <MultiSelectPills
          options={translatedOptions}
          value={(value as string[]) || []}
          onChange={onChange}
          maxSelections={question.maxSelections}
        />
      )
    }
    case 'spectrum':
      return (
        <SpectrumSliderRefined
          leftLabel={t.has(`${baseKey}.left`) ? t(`${baseKey}.left`) : question.leftLabel}
          rightLabel={t.has(`${baseKey}.right`) ? t(`${baseKey}.right`) : question.rightLabel}
          value={(value as number) ?? 50}
          onChange={onChange}
        />
      )
    case 'ranking': {
      const translatedItems = question.items.map(item => ({
        ...item,
        label: t.has(`${baseKey}.items.${item.id}`) 
          ? t(`${baseKey}.items.${item.id}`) 
          : item.label
      }))
      return (
        <RankingList
          items={translatedItems}
          value={(value as string[]) || []}
          onChange={onChange}
        />
      )
    }
    case 'short-text':
      return (
        <ShortTextRefined
          value={(value as string) || ''}
          onChange={onChange}
          placeholder={t.has(`${baseKey}.placeholder`) ? t(`${baseKey}.placeholder`) : question.placeholder}
          maxLength={question.maxLength}
        />
      )
    default:
      return null
  }
}

export default function QuestionsPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const {
    currentPillar,
    currentQuestionIndex,
    setCurrentPillar,
    setCurrentQuestionIndex,
    setAnswer,
    getAnswer,
    completePillar,
    completedPillars,
  } = useIkigaiStore()
  
  const [mounted, setMounted] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  useEffect(() => {
    if (mounted && !currentPillar) {
      router.push(`/${locale}`)
    }
  }, [mounted, currentPillar, router, locale])
  
  if (!mounted || !currentPillar) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8614D] border-t-transparent" />
      </div>
    )
  }
  
  const pillar = getPillarById(currentPillar)
  const questions = pillar.questions
  const currentQuestion = questions[currentQuestionIndex]
  const currentValue = getAnswer(currentPillar, currentQuestion.id)
  
  // Calculate total progress across all pillars
  const currentSectionIndex = SECTIONS.findIndex(s => s.id === currentPillar)
  const questionsPerSection = 3
  const totalQuestions = SECTIONS.length * questionsPerSection
  const completedQuestions = (currentSectionIndex * questionsPerSection) + currentQuestionIndex + 1
  const overallProgress = (completedQuestions / totalQuestions) * 100
  
  const pillarKeyMap: Record<string, string> = {
    'love': 'love',
    'good-at': 'goodAt',
    'world-needs': 'worldNeeds',
    'paid-for': 'paidFor'
  }
  const pillarKey = pillarKeyMap[currentPillar]
  
  const handleAnswerChange = (value: AnswerValue) => {
    setAnswer(currentPillar, currentQuestion.id, value)
  }
  
  const isAnswerValid = () => {
    if (!currentValue) return false
    
    switch (currentQuestion.type) {
      case 'multi-select':
        return (currentValue as string[]).length > 0
      case 'spectrum':
        return true
      case 'ranking':
        return true
      case 'short-text':
        return (currentValue as string).trim().length >= 10
      default:
        return true
    }
  }
  
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      completePillar(currentPillar)
      
      // Check if this is the last pillar
      const currentIndex = SECTIONS.findIndex(s => s.id === currentPillar)
      const isLastPillar = currentIndex === SECTIONS.length - 1
      
      if (isLastPillar) {
        // All pillars complete - go directly to results
        router.push(`/${locale}/results`)
      } else {
        // Show completion screen for intermediate pillars
        setShowCompletion(true)
      }
    }
  }
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      router.push(`/${locale}`)
    }
  }
  
  const handleSaveExit = () => {
    router.push(`/${locale}`)
  }
  
  const handleSkip = () => {
    handleNext()
  }
  
  const handleContinueToNextPillar = () => {
    // Find the next pillar in sequence
    const currentIndex = SECTIONS.findIndex(s => s.id === currentPillar)
    const nextPillar = SECTIONS[currentIndex + 1]
    
    if (nextPillar) {
      // Move to next pillar
      setCurrentPillar(nextPillar.id as IkigaiSection)
      setCurrentQuestionIndex(0)
      setShowCompletion(false)
    } else {
      // All pillars complete - go to results
      router.push(`/${locale}/results`)
    }
  }
  
  const handleSeeInsight = () => {
    router.push(`/${locale}/insight/${currentPillar}`)
  }
  
  const handleSeeResults = () => {
    router.push(`/${locale}/results`)
  }

  const questionKey = currentQuestion.id.replace(`${pillarKey}-`, '').replace(/-/g, '')
  const baseKey = `questions.${pillarKey}.${questionKey === 'freetext' ? 'freetext' : questionKey}`
  const translatedQuestion = t.has(`${baseKey}.question`) 
    ? t(`${baseKey}.question`) 
    : currentQuestion.question
  const translatedHint = currentQuestion.hint && t.has(`${baseKey}.hint`)
    ? t(`${baseKey}.hint`)
    : currentQuestion.hint

  const wisdom = WISDOM_QUOTES[currentPillar] || WISDOM_QUOTES['love']
  
  // Show completion screen
  if (showCompletion) {
    return (
        <div 
          style={{
            minHeight: '100vh',
            fontFamily: "'DM Sans', system-ui, sans-serif",
            background: 'linear-gradient(180deg, #F5E8DA 0%, #F0DBCB 100%)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
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

          {/* Completion content */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', maxWidth: '400px' }}
            >
              {/* Success icon */}
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E8614D 0%, #D4784A 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                boxShadow: '0 8px 32px rgba(232,97,77,0.3)',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '28px',
                fontWeight: 400,
                color: '#3D2E29',
                marginBottom: '12px',
              }}>
                {t(`pillars.${pillarKey}.title`)} complete!
              </h2>
              
              <p style={{
                fontSize: '15px',
                color: 'rgba(61,46,41,0.55)',
                fontWeight: 300,
                marginBottom: '32px',
                lineHeight: 1.6,
              }}>
                {t('completion.description')}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={handleSeeInsight}
                  style={{
                    padding: '16px 32px',
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(61,46,41,0.1)',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 400,
                    color: '#3D2E29',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t('completion.seeInsight')}
                </button>
                
                <button
                  onClick={handleContinueToNextPillar}
                  style={{
                    padding: '16px 32px',
                    background: '#E8614D',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 4px 20px rgba(232,97,77,0.25)',
                  }}
                >
                  {t('completion.continueNext')}
                </button>
                
                <button
                  onClick={handleSeeResults}
                  style={{
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 300,
                    color: 'rgba(61,46,41,0.4)',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {t('completion.viewResults')}
                </button>
              </div>
            </motion.div>
          </div>

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
  
  return (
      <div style={{
        minHeight: '100vh',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: 'linear-gradient(180deg, #F5E8DA 0%, #F2E0D0 50%, #F0DBCB 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Top bar */}
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
            onClick={handleSaveExit}
            style={{
              fontSize: '13px',
              color: 'rgba(61,46,41,0.4)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Save & exit
          </button>
        </header>

        {/* Progress area */}
        <div style={{ padding: '0 40px 0', maxWidth: '720px', width: '100%', margin: '0 auto' }}>
          {/* Section stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '8px' }}>
            {SECTIONS.map((sec, i) => {
              const isActive = sec.id === currentPillar
              const isPast = completedPillars.includes(sec.id as IkigaiSection)
              return (
                <div key={sec.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isActive || isPast ? '#E8614D' : 'rgba(61,46,41,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: isActive || isPast ? '#fff' : 'rgba(61,46,41,0.3)',
                      transition: 'all 0.3s ease',
                    }}>
                      {isPast ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isActive ? 500 : 300,
                      color: isActive ? '#3D2E29' : 'rgba(61,46,41,0.35)',
                      letterSpacing: '0.02em',
                    }}>
                      {sec.label}
                    </span>
                  </div>
                  {i < SECTIONS.length - 1 && (
                    <div style={{
                      flex: 1,
                      height: '1px',
                      margin: '0 12px',
                      background: isPast ? '#E8614D' : 'rgba(61,46,41,0.08)',
                    }} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '3px',
            borderRadius: '2px',
            background: 'rgba(61,46,41,0.06)',
            marginBottom: '6px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${overallProgress}%`,
              height: '100%',
              borderRadius: '2px',
              background: '#E8614D',
              transition: 'width 0.4s ease',
            }} />
          </div>

          {/* Counter */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}>
            <span style={{ fontSize: '12px', color: 'rgba(61,46,41,0.35)', fontWeight: 300 }}>
              {completedQuestions} of {totalQuestions} questions
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(61,46,41,0.35)', fontWeight: 300 }}>
              {t(`pillars.${pillarKey}.title`)} · Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          maxWidth: '720px',
          width: '100%',
          margin: '0 auto',
          padding: '0 40px 120px',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Question */}
              <h1 style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 400,
                color: '#3D2E29',
                lineHeight: 1.25,
                margin: '0 0 8px',
              }}>
                {translatedQuestion}
              </h1>
              
              {translatedHint && (
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(61,46,41,0.45)',
                  fontWeight: 300,
                  margin: '0 0 28px',
                }}>
                  {translatedHint}
                </p>
              )}

              {/* Question input */}
              <QuestionRenderer
                question={currentQuestion}
                value={currentValue}
                onChange={handleAnswerChange}
                t={t}
                pillarKey={pillarKey}
              />

              {/* Inspirational whisper */}
              <div style={{
                textAlign: 'center',
                padding: '24px 0 0',
              }}>
                <p style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: 'rgba(61,46,41,0.25)',
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}>
                  {wisdom.quote}
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(61,46,41,0.2)',
                  fontWeight: 300,
                  marginTop: '4px',
                  letterSpacing: '0.04em',
                }}>
                  {wisdom.author}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sticky bottom bar */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 40px 24px',
          background: 'linear-gradient(0deg, rgba(240,219,203,1) 0%, rgba(240,219,203,0.95) 60%, rgba(240,219,203,0) 100%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          zIndex: 50,
        }}>
          <button
            onClick={handleSkip}
            style={{
              fontSize: '13px',
              color: 'rgba(61,46,41,0.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 300,
              padding: '10px 16px',
            }}
          >
            Skip this question
          </button>
          <button
            onClick={handleNext}
            disabled={!isAnswerValid()}
            style={{
              padding: '14px 48px',
              background: isAnswerValid() ? '#E8614D' : 'rgba(61,46,41,0.1)',
              color: isAnswerValid() ? '#fff' : 'rgba(61,46,41,0.3)',
              border: 'none',
              borderRadius: '14px',
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              cursor: isAnswerValid() ? 'pointer' : 'default',
              boxShadow: isAnswerValid() ? '0 4px 20px rgba(232,97,77,0.25)' : 'none',
              transition: 'all 0.25s ease',
            }}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Complete' : 'Continue'}
          </button>
        </div>
      </div>
  )
}
