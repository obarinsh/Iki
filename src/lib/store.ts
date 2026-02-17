import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type IkigaiSection = 'love' | 'good-at' | 'world-needs' | 'paid-for'

export type AnswerValue = string | string[] | number

export interface Answer {
  questionId: string
  value: AnswerValue
}

export interface PillarInsight {
  pillarId: IkigaiSection
  insight: string
  keywords: string[]
}

export interface FullAnalysis {
  ikigaiStatement: string
  pillars: {
    id: IkigaiSection
    summary: string
    keywords: string[]
    clarityScore: number  // 1-10: How clear/developed this pillar is
    potentialScore: number  // 1-10: Growth potential in this area
  }[]
  intersections: {
    id: string
    title: string
    description: string
  }[]
  weeklyActions: {
    title: string
    description: string
  }[]
  careerPaths: {
    title: string
    matchReason: string
    firstStep: string
  }[]
  blindSpot?: string
}

export interface IkigaiStore {
  // Current progress
  currentPillar: IkigaiSection | null
  currentQuestionIndex: number
  
  // Completed pillars (in order completed)
  completedPillars: IkigaiSection[]
  
  // Answers organized by pillar
  answers: Record<IkigaiSection, Answer[]>
  
  // Pillar insights (optional, shown after completing pillar)
  pillarInsights: Record<IkigaiSection, PillarInsight | null>
  
  // Full analysis (when user requests results)
  fullAnalysis: FullAnalysis | null
  
  // Loading states
  insightLoading: boolean
  analysisLoading: boolean
  
  // Actions
  setCurrentPillar: (pillar: IkigaiSection | null) => void
  setCurrentQuestionIndex: (index: number) => void
  
  setAnswer: (pillar: IkigaiSection, questionId: string, value: AnswerValue) => void
  getAnswer: (pillar: IkigaiSection, questionId: string) => AnswerValue | undefined
  
  completePillar: (pillar: IkigaiSection) => void
  isPillarComplete: (pillar: IkigaiSection) => boolean
  
  setPillarInsight: (pillar: IkigaiSection, insight: PillarInsight) => void
  setInsightLoading: (loading: boolean) => void
  
  setFullAnalysis: (analysis: FullAnalysis) => void
  setAnalysisLoading: (loading: boolean) => void
  
  resetAll: () => void
  
  // Computed
  getCompletedCount: () => number
  canViewResults: () => boolean
}

const initialState = {
  currentPillar: null as IkigaiSection | null,
  currentQuestionIndex: 0,
  completedPillars: [] as IkigaiSection[],
  answers: {
    'love': [],
    'good-at': [],
    'world-needs': [],
    'paid-for': [],
  } as Record<IkigaiSection, Answer[]>,
  pillarInsights: {
    'love': null,
    'good-at': null,
    'world-needs': null,
    'paid-for': null,
  } as Record<IkigaiSection, PillarInsight | null>,
  fullAnalysis: null as FullAnalysis | null,
  insightLoading: false,
  analysisLoading: false,
}

export const useIkigaiStore = create<IkigaiStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentPillar: (pillar) => set({ currentPillar: pillar, currentQuestionIndex: 0 }),
      
      setCurrentQuestionIndex: (index) => set({ currentQuestionIndex: index }),
      
      setAnswer: (pillar, questionId, value) => {
        const currentAnswers = get().answers[pillar]
        const existingIndex = currentAnswers.findIndex(a => a.questionId === questionId)
        
        let newAnswers: Answer[]
        if (existingIndex >= 0) {
          newAnswers = currentAnswers.map((a, i) => 
            i === existingIndex ? { questionId, value } : a
          )
        } else {
          newAnswers = [...currentAnswers, { questionId, value }]
        }
        
        set({
          answers: {
            ...get().answers,
            [pillar]: newAnswers,
          }
        })
      },
      
      getAnswer: (pillar, questionId) => {
        const answer = get().answers[pillar].find(a => a.questionId === questionId)
        return answer?.value
      },
      
      completePillar: (pillar) => {
        const completed = get().completedPillars
        if (!completed.includes(pillar)) {
          set({ completedPillars: [...completed, pillar] })
        }
      },
      
      isPillarComplete: (pillar) => {
        return get().completedPillars.includes(pillar)
      },
      
      setPillarInsight: (pillar, insight) => {
        set({
          pillarInsights: {
            ...get().pillarInsights,
            [pillar]: insight,
          }
        })
      },
      
      setInsightLoading: (loading) => set({ insightLoading: loading }),
      
      setFullAnalysis: (analysis) => set({ fullAnalysis: analysis }),
      
      setAnalysisLoading: (loading) => set({ analysisLoading: loading }),
      
      resetAll: () => set(initialState),
      
      getCompletedCount: () => get().completedPillars.length,
      
      canViewResults: () => get().completedPillars.length >= 1,
    }),
    {
      name: 'ikigai-storage-v2',
    }
  )
)
