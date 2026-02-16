import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { IkigaiSection, Answer } from '@/lib/store'
import { getPillarById } from '@/lib/questions'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function buildInsightPrompt(pillarId: IkigaiSection, answers: Answer[]): string {
  const pillar = getPillarById(pillarId)
  
  const answersText = answers.map(a => {
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
    
    return `Q: ${questionText}\nA: ${valueText}`
  }).join('\n\n')
  
  return `You are an insightful career coach analyzing someone's responses about "${pillar.title}".

Based on their answers below, provide a brief, specific insight (2-3 sentences max). 

Rules:
- Be specific to THEIR answers, not generic
- Draw out a non-obvious pattern or connection
- Use warm but direct language
- No platitudes or generic advice
- End with something that makes them think "yes, that's me"

Their responses:
${answersText}

Respond with ONLY the insight text, no headers or formatting. Also include 3-5 keywords that capture their themes (comma separated on a new line starting with "Keywords: ").`
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
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    
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
    console.error('Error generating insight:', error)
    
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
      { error: 'Failed to generate insight' },
      { status: 500 }
    )
  }
}
