import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { IkigaiSection, Answer } from '@/lib/store'
import { getPillarById } from '@/lib/questions'

// Extend timeout for AI generation
export const maxDuration = 30

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function buildInsightPrompt(pillarId: IkigaiSection, answers: Answer[]): string {
  const pillar = getPillarById(pillarId)
  
  const answersText = answers.map(a => {
    const question = pillar.questions.find(q => q.id === a.questionId)
    const questionText = question?.question || 'Unknown question'
    
    let valueText: string
    if (Array.isArray(a.value)) {
      if (question?.type === 'multi-select' || question?.type === 'ranking') {
        const opts = (question as any).options || (question as any).items || []
        
        // Separate predefined options from custom ones
        const predefinedValues: string[] = []
        const customValues: string[] = []
        
        a.value.forEach((id: string) => {
          if (id.startsWith('custom:')) {
            // Custom user-provided answer - these are especially important!
            customValues.push(id.replace('custom:', ''))
          } else {
            const opt = opts.find((o: any) => o.id === id)
            predefinedValues.push(opt?.label || id)
          }
        })
        
        // Combine predefined and custom values, highlighting custom ones
        const allValues = [...predefinedValues, ...customValues.map(v => `"${v}" (their own words)`)]
        valueText = allValues.join(', ')
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
    
    return `Q: ${questionText}\nA: ${valueText}`
  }).join('\n\n')
  
  const pillarContext: Record<string, string> = {
    'love': 'what energizes and fulfills them - look for the WHY behind their choices, not just what they listed',
    'good-at': 'their unique skill combination - what makes their blend of abilities distinctive',
    'world-needs': 'their values and who they want to help - what underlying motivation drives their choices',
    'paid-for': 'how they want to create value - their relationship with work and compensation'
  }

  return `You are a perceptive career psychologist with a gift for seeing patterns others miss.

Analyze these responses about "${pillar.title}" (${pillarContext[pillarId] || 'their perspective'}).

Their responses:
${answersText}

Provide ONE powerful insight (3-4 sentences) that:
1. Identifies a NON-OBVIOUS pattern or connection in their answers
2. Reveals something about their underlying motivation or values they might not have consciously articulated
3. Uses their specific words but frames them in an illuminating new way
4. Ends with a "mirror moment" - something that makes them feel truly seen

IMPORTANT: Answers marked "(their own words)" are things the user typed themselves - these are GOLD. Feature these custom responses prominently as they reveal their most authentic thoughts.

AVOID:
- Simply summarizing or listing what they said
- Generic statements that could apply to anyone
- Platitudes like "you value meaningful work" or "you want to make a difference"
- Starting with "You" or "Based on your answers"

START with an observation or insight directly. Be bold. Be specific.

After the insight, add a new line with "Keywords: " followed by 4-5 specific, evocative keywords that capture the ESSENCE of their profile (not generic words like "passion" or "growth").`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pillarId, answers } = body as {
      pillarId: IkigaiSection
      answers: Answer[]
    }
    
    if (!answers || answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers provided' },
        { status: 400 }
      )
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }
    
    const prompt = buildInsightPrompt(pillarId, answers)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      }
    })
    
    // Add timeout to prevent long hangs
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000)
    })
    
    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise
    ]) as Awaited<ReturnType<typeof model.generateContent>>
    
    const response = await result.response
    const text = response.text()
    
    // Parse response
    const lines = text.trim().split('\n')
    const keywordsLine = lines.find(l => l.toLowerCase().startsWith('keywords:'))
    const insight = lines.filter(l => !l.toLowerCase().startsWith('keywords:')).join(' ').trim()
    const keywords = keywordsLine 
      ? keywordsLine.replace(/^keywords:\s*/i, '').split(',').map(k => k.trim())
      : []
    
    return NextResponse.json({
      pillarId,
      insight,
      keywords,
    })
    
  } catch (error: any) {
    console.error('Error generating insight:', error?.message || error)
    
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
    
    // Return detailed error for debugging
    return NextResponse.json(
      { error: error?.message || 'Failed to generate insight' },
      { status: 500 }
    )
  }
}
