import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { IkigaiSection, Answer } from '@/lib/store'
import { pillars, getPillarById } from '@/lib/questions'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function formatAnswers(pillarId: IkigaiSection, answers: Answer[]): string {
  const pillar = getPillarById(pillarId)
  
  return answers.map(a => {
    const question = pillar.questions.find(q => q.id === a.questionId)
    const questionText = question?.question || 'Unknown question'
    
    let valueText: string
    if (Array.isArray(a.value)) {
      if (question?.type === 'multi-select') {
        const opts = (question as any).options || []
        valueText = a.value.map(id => opts.find((o: any) => o.id === id)?.label || id).join(', ')
      } else if (question?.type === 'ranking') {
        const items = (question as any).items || []
        valueText = a.value.map((id, i) => `${i + 1}. ${items.find((item: any) => item.id === id)?.label || id}`).join('; ')
      } else {
        valueText = a.value.join(', ')
      }
    } else if (typeof a.value === 'number') {
      if (question?.type === 'spectrum') {
        const left = (question as any).leftLabel
        const right = (question as any).rightLabel
        if (a.value < 40) valueText = `Leaning toward: ${left}`
        else if (a.value > 60) valueText = `Leaning toward: ${right}`
        else valueText = `Balanced between ${left} and ${right}`
      } else {
        valueText = String(a.value)
      }
    } else {
      valueText = String(a.value)
    }
    
    return `- ${questionText}: ${valueText}`
  }).join('\n')
}

function buildAnalysisPrompt(allAnswers: Record<IkigaiSection, Answer[]>): string {
  const sections = pillars
    .filter(p => allAnswers[p.id]?.length > 0)
    .map(p => `## ${p.title}\n${formatAnswers(p.id, allAnswers[p.id])}`)
    .join('\n\n')

  return `You are an expert career coach analyzing someone's Ikigai responses. Based on their answers, generate a comprehensive, SPECIFIC analysis.

CRITICAL: Every insight must reference their ACTUAL answers. No generic advice. If they mentioned "teaching" and "problem-solving", say exactly that. Echo their words back.

USER'S RESPONSES:
${sections}

Generate a JSON response with this exact structure:
{
  "ikigaiStatement": "A powerful single sentence (15-25 words) that captures their unique purpose. This is THE moment - make it feel like you truly understood them. Use their specific themes, not generic language.",
  
  "pillars": [
    {
      "id": "love",
      "summary": "2-3 sentences about what energizes them, using their specific activities and preferences",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    {
      "id": "good-at",
      "summary": "2-3 sentences about their strengths, referencing specific skills they mentioned",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    {
      "id": "world-needs",
      "summary": "2-3 sentences about their impact orientation, using their causes and who they want to help",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    },
    {
      "id": "paid-for",
      "summary": "2-3 sentences about their career direction, using their industry interests",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ],
  
  "intersections": [
    {
      "id": "passion",
      "title": "Your Passion",
      "subtitle": "Where love meets ability",
      "description": "1-2 sentences connecting what they love with what they're good at"
    },
    {
      "id": "mission",
      "title": "Your Mission",
      "subtitle": "Where love meets purpose",
      "description": "1-2 sentences connecting what they love with what the world needs"
    },
    {
      "id": "profession",
      "title": "Your Profession",
      "subtitle": "Where ability meets market",
      "description": "1-2 sentences connecting what they're good at with what they can be paid for"
    },
    {
      "id": "vocation",
      "title": "Your Vocation",
      "subtitle": "Where purpose meets market",
      "description": "1-2 sentences connecting what the world needs with what they can be paid for"
    }
  ],
  
  "weeklyActions": [
    {
      "title": "Short action title",
      "description": "Specific, concrete action they can take THIS WEEK. Reference their actual interests/skills."
    },
    {
      "title": "Short action title",
      "description": "Another specific action"
    },
    {
      "title": "Short action title",
      "description": "A third specific action"
    }
  ],
  
  "careerPaths": [
    {
      "title": "Specific role or career path",
      "matchReason": "Why this fits their profile - reference their specific answers",
      "firstStep": "One concrete first step to explore this path"
    },
    {
      "title": "Second career option",
      "matchReason": "Why this fits",
      "firstStep": "First step"
    },
    {
      "title": "Third career option",
      "matchReason": "Why this fits",
      "firstStep": "First step"
    }
  ]
}

Return ONLY valid JSON, no markdown formatting or code blocks.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { answers } = body as {
      answers: Record<IkigaiSection, Answer[]>
    }
    
    // Check we have at least one pillar with answers
    const hasAnswers = Object.values(answers).some(
      pillarAnswers => pillarAnswers && pillarAnswers.length > 0
    )
    
    if (!hasAnswers) {
      return NextResponse.json(
        { error: 'Please complete at least one section' },
        { status: 400 }
      )
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    const prompt = buildAnalysisPrompt(answers)
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    
    // Add timeout to prevent long hangs (60s for full analysis)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 60000)
    })
    
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof model.generateContent>>
    
    const response = await result.response
    let text = response.text()
    
    // Clean up response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    try {
      const analysis = JSON.parse(text)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json(
        { error: 'Failed to parse analysis' },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('Error generating analysis:', error)
    
    // Check for rate limit error
    if (error?.status === 429 || error?.message?.includes('429')) {
      return NextResponse.json(
        { error: 'API rate limit exceeded. Please wait a moment and try again.' },
        { status: 429 }
      )
    }
    
    // Check for timeout or network error
    if (error?.message?.includes('timeout') || error?.message?.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
