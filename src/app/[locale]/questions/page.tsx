'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookLayout } from '@/components/shared/BookLayout'
import { MultiSelect, SpectrumSlider, RankingList, ShortText } from '@/components/inputs'
import { useIkigaiStore, IkigaiSection, AnswerValue } from '@/lib/store'
import { getPillarById, Question } from '@/lib/questions'
import { cn } from '@/lib/utils'

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
      // Translate options
      const translatedOptions = question.options.map(opt => ({
        ...opt,
        label: t.has(`${baseKey}.options.${opt.id}`) 
          ? t(`${baseKey}.options.${opt.id}`) 
          : opt.label
      }))
      return (
        <MultiSelect
          options={translatedOptions}
          value={(value as string[]) || []}
          onChange={onChange}
          maxSelections={question.maxSelections}
        />
      )
    }
    case 'spectrum':
      return (
        <SpectrumSlider
          leftLabel={t.has(`${baseKey}.left`) ? t(`${baseKey}.left`) : question.leftLabel}
          rightLabel={t.has(`${baseKey}.right`) ? t(`${baseKey}.right`) : question.rightLabel}
          value={(value as number) ?? 50}
          onChange={onChange}
        />
      )
    case 'ranking': {
      // Translate items
      const translatedItems = question.items.map(item => ({
        ...item,
        label: t.has(`${baseKey}.items.${item.id}`) 
          ? t(`${baseKey}.items.${item.id}`) 
          : item.label
      }))
      return (
        <RankingList
          items={translatedItems}
          value={(value as string[]) || question.items.map(i => i.id)}
          onChange={onChange}
        />
      )
    }
    case 'short-text':
      return (
        <ShortText
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
  } = useIkigaiStore()
  
  const [mounted, setMounted] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Redirect if no pillar selected
  useEffect(() => {
    if (mounted && !currentPillar) {
      router.push(`/${locale}`)
    }
  }, [mounted, currentPillar, router, locale])
  
  if (!mounted || !currentPillar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }
  
  const pillar = getPillarById(currentPillar)
  const questions = pillar.questions
  const currentQuestion = questions[currentQuestionIndex]
  const currentValue = getAnswer(currentPillar, currentQuestion.id)
  
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100
  
  // Map pillar id to translation key
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
        return true // Always valid (has default 50)
      case 'ranking':
        return true // Always valid (has default order)
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
      // Pillar complete
      completePillar(currentPillar)
      setShowCompletion(true)
    }
  }
  
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else {
      router.push(`/${locale}`)
    }
  }
  
  const handleContinue = () => {
    setCurrentPillar(null)
    router.push(`/${locale}`)
  }
  
  const handleSeeInsight = () => {
    router.push(`/${locale}/insight/${currentPillar}`)
  }
  
  const handleSeeResults = () => {
    router.push(`/${locale}/results`)
  }

  // Get translated question text
  const questionKey = currentQuestion.id.replace(`${pillarKey}-`, '').replace(/-/g, '')
  const baseKey = `questions.${pillarKey}.${questionKey === 'freetext' ? 'freetext' : questionKey}`
  const translatedQuestion = t.has(`${baseKey}.question`) 
    ? t(`${baseKey}.question`) 
    : currentQuestion.question
  const translatedHint = currentQuestion.hint && t.has(`${baseKey}.hint`)
    ? t(`${baseKey}.hint`)
    : currentQuestion.hint
  
  // Show completion screen
  if (showCompletion) {
    return (
      <BookLayout pillar={currentPillar} questionIndex={questions.length - 1}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-8 bg-background">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 max-w-sm"
          >
            <div className={cn(
              'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
              'bg-gradient-to-br', pillar.color, 'text-white text-3xl shadow-lg'
            )}>
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-medium">
                {t('completion.title', { pillar: t(`pillars.${pillarKey}.title`) })}
              </h2>
              <p className="text-muted-foreground">
                {t('completion.description')}
              </p>
            </div>
            
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleSeeInsight}
                variant="outline"
                className="w-full rounded-full py-6"
              >
                {t('completion.seeInsight')}
              </Button>
              
              <Button
                onClick={handleContinue}
                className="w-full rounded-full py-6 bg-primary"
              >
                {t('completion.continueNext')}
              </Button>
              
              <Button
                onClick={handleSeeResults}
                variant="ghost"
                className="w-full text-muted-foreground"
              >
                {t('completion.viewResults')}
              </Button>
            </div>
          </motion.div>
        </div>
      </BookLayout>
    )
  }
  
  return (
    <BookLayout pillar={currentPillar} questionIndex={currentQuestionIndex}>
      <div className="flex min-h-screen flex-col px-6 py-8 lg:px-12 bg-background">
        {/* Header */}
        <header className="space-y-4">
          {/* Back button and progress */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              <svg className="h-5 w-5 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1">
              <Progress value={progressPercent} className="h-2" />
            </div>
            
            <span className="text-sm text-muted-foreground">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          
          {/* Pillar title */}
          <div>
            <p className="text-sm text-muted-foreground">{t(`pillars.${pillarKey}.subtitle`)}</p>
            <h1 className="font-serif text-xl font-medium">{t(`pillars.${pillarKey}.title`)}</h1>
          </div>
        </header>
        
        {/* Question */}
        <main className="flex flex-1 flex-col justify-center py-8 lg:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 max-w-lg"
            >
              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-medium leading-snug lg:text-3xl">
                  {translatedQuestion}
                </h2>
                {translatedHint && (
                  <p className="text-sm text-muted-foreground">
                    {translatedHint}
                  </p>
                )}
              </div>
              
              <QuestionRenderer
                question={currentQuestion}
                value={currentValue}
                onChange={handleAnswerChange}
                t={t}
                pillarKey={pillarKey}
              />
            </motion.div>
          </AnimatePresence>
        </main>
        
        {/* Footer */}
        <footer className="max-w-lg">
          <Button
            onClick={handleNext}
            disabled={!isAnswerValid()}
            className="w-full rounded-full py-6 bg-primary text-primary-foreground"
          >
            {currentQuestionIndex === questions.length - 1 ? t('completion.viewResults').replace('View', 'Complete').replace('results now', 'Section') : t('common.continue')}
          </Button>
        </footer>
      </div>
    </BookLayout>
  )
}
