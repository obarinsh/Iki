import { IkigaiSection } from './store'

export type QuestionType = 'multi-select' | 'spectrum' | 'ranking' | 'short-text'

export interface BaseQuestion {
  id: string
  type: QuestionType
  question: string
  hint?: string
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi-select'
  options: { id: string; label: string }[]
  maxSelections: number
}

export interface SpectrumQuestion extends BaseQuestion {
  type: 'spectrum'
  leftLabel: string
  rightLabel: string
}

export interface RankingQuestion extends BaseQuestion {
  type: 'ranking'
  items: { id: string; label: string }[]
}

export interface ShortTextQuestion extends BaseQuestion {
  type: 'short-text'
  placeholder: string
  maxLength: number
}

export type Question = MultiSelectQuestion | SpectrumQuestion | RankingQuestion | ShortTextQuestion

export interface PillarConfig {
  id: IkigaiSection
  title: string
  subtitle: string
  description: string
  color: string
  questions: Question[]
}

export const pillars: PillarConfig[] = [
  {
    id: 'love',
    title: 'What You Love',
    subtitle: 'Activities that energize you',
    description: 'What makes you lose track of time?',
    color: 'from-pink-400 to-rose-300',
    questions: [
      {
        id: 'love-activities',
        type: 'multi-select',
        question: 'Which of these activities energize you?',
        hint: 'Pick up to 5 that resonate most',
        options: [
          { id: 'creating', label: 'Creating things from scratch' },
          { id: 'problem-solving', label: 'Solving complex problems' },
          { id: 'teaching', label: 'Teaching or explaining' },
          { id: 'organizing', label: 'Organizing and planning' },
          { id: 'building', label: 'Building relationships' },
          { id: 'analyzing', label: 'Analyzing data or patterns' },
          { id: 'designing', label: 'Designing experiences' },
          { id: 'writing', label: 'Writing or storytelling' },
          { id: 'leading', label: 'Leading teams or projects' },
          { id: 'researching', label: 'Deep research and learning' },
          { id: 'helping', label: 'Helping people directly' },
          { id: 'innovating', label: 'Experimenting with new ideas' },
        ],
        maxSelections: 5,
      },
      {
        id: 'love-spectrum',
        type: 'spectrum',
        question: 'What kind of work appeals to you more?',
        leftLabel: 'Creative and open-ended',
        rightLabel: 'Structured and analytical',
      },
      {
        id: 'love-freetext',
        type: 'short-text',
        question: 'What would you do on a free Saturday with no obligations?',
        hint: 'Be specific - the details matter',
        placeholder: 'I would probably...',
        maxLength: 280,
      },
    ],
  },
  {
    id: 'good-at',
    title: 'What You\'re Good At',
    subtitle: 'Skills and natural abilities',
    description: 'Where do you have an edge?',
    color: 'from-amber-400 to-yellow-300',
    questions: [
      {
        id: 'skills-select',
        type: 'multi-select',
        question: 'What do people come to you for help with?',
        hint: 'Pick the ones you hear most often',
        options: [
          { id: 'advice', label: 'Life or career advice' },
          { id: 'technical', label: 'Technical problems' },
          { id: 'creative', label: 'Creative projects' },
          { id: 'writing', label: 'Writing or editing' },
          { id: 'planning', label: 'Planning and strategy' },
          { id: 'conflict', label: 'Resolving conflicts' },
          { id: 'explaining', label: 'Explaining complex things' },
          { id: 'decisions', label: 'Making tough decisions' },
          { id: 'motivation', label: 'Motivation and support' },
          { id: 'organization', label: 'Getting organized' },
          { id: 'design', label: 'Design feedback' },
          { id: 'numbers', label: 'Numbers and analysis' },
        ],
        maxSelections: 5,
      },
      {
        id: 'skills-ranking',
        type: 'ranking',
        question: 'Rank these by your confidence level',
        hint: 'Top = most confident',
        items: [
          { id: 'communicate', label: 'Communicating clearly' },
          { id: 'learn', label: 'Learning new things quickly' },
          { id: 'execute', label: 'Executing and finishing' },
          { id: 'think', label: 'Strategic thinking' },
          { id: 'connect', label: 'Connecting with people' },
        ],
      },
      {
        id: 'skills-freetext',
        type: 'short-text',
        question: 'What skill have people complimented that surprised you?',
        hint: 'Often our best abilities feel invisible to us',
        placeholder: 'People have told me I\'m good at...',
        maxLength: 280,
      },
    ],
  },
  {
    id: 'world-needs',
    title: 'What The World Needs',
    subtitle: 'Impact that matters to you',
    description: 'Where do you want to make a difference?',
    color: 'from-teal-400 to-emerald-300',
    questions: [
      {
        id: 'causes-select',
        type: 'multi-select',
        question: 'Which problems do you care about solving?',
        hint: 'Pick the ones that genuinely bother you',
        options: [
          { id: 'education', label: 'Education access' },
          { id: 'health', label: 'Health and wellness' },
          { id: 'environment', label: 'Environment and climate' },
          { id: 'inequality', label: 'Economic inequality' },
          { id: 'mental-health', label: 'Mental health' },
          { id: 'technology', label: 'Ethical technology' },
          { id: 'community', label: 'Local community' },
          { id: 'creativity', label: 'Arts and culture' },
          { id: 'justice', label: 'Social justice' },
          { id: 'innovation', label: 'Scientific progress' },
          { id: 'connection', label: 'Human connection' },
          { id: 'productivity', label: 'Work and productivity' },
        ],
        maxSelections: 4,
      },
      {
        id: 'impact-spectrum',
        type: 'spectrum',
        question: 'What scale of impact appeals to you?',
        leftLabel: 'Deep impact on few people',
        rightLabel: 'Broad impact on many',
      },
      {
        id: 'help-freetext',
        type: 'short-text',
        question: 'Who do you most want to help, and why them specifically?',
        hint: 'Be specific about the people and your connection to them',
        placeholder: 'I want to help...',
        maxLength: 350,
      },
    ],
  },
  {
    id: 'paid-for',
    title: 'What You Can Be Paid For',
    subtitle: 'Practical career reality',
    description: 'Where does the market value what you offer?',
    color: 'from-violet-400 to-purple-300',
    questions: [
      {
        id: 'industries-select',
        type: 'multi-select',
        question: 'Which industries or fields interest you?',
        hint: 'Pick ones you\'d genuinely explore',
        options: [
          { id: 'tech', label: 'Technology' },
          { id: 'healthcare', label: 'Healthcare' },
          { id: 'education', label: 'Education' },
          { id: 'finance', label: 'Finance' },
          { id: 'creative', label: 'Creative industries' },
          { id: 'nonprofit', label: 'Nonprofit / NGO' },
          { id: 'consulting', label: 'Consulting' },
          { id: 'startups', label: 'Startups' },
          { id: 'government', label: 'Government / Public sector' },
          { id: 'media', label: 'Media / Entertainment' },
          { id: 'retail', label: 'Retail / E-commerce' },
          { id: 'manufacturing', label: 'Manufacturing / Hardware' },
        ],
        maxSelections: 4,
      },
      {
        id: 'work-spectrum',
        type: 'spectrum',
        question: 'What matters more in your work setup?',
        leftLabel: 'Stability and security',
        rightLabel: 'Flexibility and autonomy',
      },
      {
        id: 'paid-freetext',
        type: 'short-text',
        question: 'What work have you enjoyed getting paid for, and what made it good?',
        hint: 'Even small gigs or side projects count',
        placeholder: 'I\'ve enjoyed getting paid to...',
        maxLength: 350,
      },
    ],
  },
]

export const getPillarById = (id: IkigaiSection): PillarConfig => {
  return pillars.find(p => p.id === id) || pillars[0]
}

export const getPillarByIndex = (index: number): PillarConfig => {
  return pillars[index] || pillars[0]
}

export const getTotalQuestions = (): number => {
  return pillars.reduce((total, pillar) => total + pillar.questions.length, 0)
}
