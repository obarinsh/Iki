import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { IkigaiSection, Answer } from '@/lib/store'
import { pillars, getPillarById } from '@/lib/questions'

// Extend timeout for AI generation (max 60s for Vercel Pro, 10s for Hobby)
export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

function formatAnswers(pillarId: IkigaiSection, answers: Answer[]): string {
  const pillar = getPillarById(pillarId)
  
  return answers.map(a => {
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
            // Custom user-provided answer
            customValues.push(id.replace('custom:', ''))
          } else {
            // Predefined option
            const opt = opts.find((o: any) => o.id === id)
            predefinedValues.push(opt?.label || id)
          }
        })
        
        // Combine predefined and custom values
        const allValues = [...predefinedValues, ...customValues.map(v => `"${v}" (their own answer)`)]
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
    
    return `- ${questionText}: ${valueText}`
  }).join('\n')
}

function buildAnalysisPrompt(allAnswers: Record<IkigaiSection, Answer[]>): string {
  const sections = pillars
    .filter(p => allAnswers[p.id]?.length > 0)
    .map(p => `## ${p.title}\n${formatAnswers(p.id, allAnswers[p.id])}`)
    .join('\n\n')

  return `You are a world-class career psychologist and Ikigai expert with 20 years of experience helping people find their purpose. You have a gift for seeing patterns others miss and articulating insights that make people say "I never thought of it that way, but that's exactly right."

YOUR TASK: Analyze this person's responses and provide DEEP, ANALYTICAL insights - not surface-level summaries.

ANALYSIS APPROACH:
1. PATTERN RECOGNITION: Look for hidden connections between their answers across all four pillars. What themes keep appearing? What's the thread that ties everything together?

2. PSYCHOLOGICAL DEPTH: Go beyond what they said to understand WHY they might feel this way. What underlying values or needs are driving their choices?

3. TENSION & OPPORTUNITY: Identify any interesting tensions or contradictions in their answers - these often point to growth opportunities or unexplored paths.

4. NON-OBVIOUS INSIGHTS: Don't just repeat their answers back. Synthesize and reveal something they might not have consciously realized about themselves.

5. CUSTOM ANSWERS ARE GOLD: Pay special attention to answers marked "(their own answer)" or "(their own words)" - these are things the user typed themselves rather than selecting from options. These custom responses often reveal their most authentic thoughts and should be prominently featured in your analysis.

5. SPECIFICITY: Use their exact words and examples, but frame them in new, illuminating ways.

USER'S RESPONSES:
${sections}

Generate a JSON response with this structure:

{
  "ikigaiStatement": "A profound, specific sentence (20-30 words) that synthesizes their unique purpose. This should feel like a revelation - capturing not just WHAT they do but WHO they are at their core. Avoid generic phrases like 'making a difference' or 'helping others grow'. Instead, articulate their SPECIFIC intersection of passion, skill, need, and value.",
  
  "pillars": [
    {
      "id": "love",
      "summary": "2 sentences MAX. Explain the PATTERN of what energizes them - is it creativity, connection, problem-solving? What does this reveal about their core motivation?",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "clarityScore": 8.5,
      "potentialScore": 9.5
    },
    {
      "id": "good-at",
      "summary": "2 sentences MAX. What's their distinctive skill COMBINATION? What's their 'superpower'?",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "clarityScore": 7.0,
      "potentialScore": 9.0
    },
    {
      "id": "world-needs",
      "summary": "2 sentences MAX. What problems move them? Who are they drawn to help and why?",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "clarityScore": 6.5,
      "potentialScore": 8.5
    },
    {
      "id": "paid-for",
      "summary": "2 sentences MAX. What kind of work environment and value creation suits them?",
      "keywords": ["keyword1", "keyword2", "keyword3"],
      "clarityScore": 5.5,
      "potentialScore": 8.0
    }
  ],
  
  NOTE ON SCORES:
  - clarityScore (1-10): How clearly defined and self-aware they are about this pillar. High = they know exactly what they want/have. Low = vague, uncertain, or unexplored.
  - potentialScore (1-10): How much room for growth/development exists. High = lots of untapped potential. Low = already maximized.
  
  Score based on: answer depth, specificity, custom answers (show high clarity), contradictions (show low clarity), enthusiasm in word choice.
  
  "intersections": [
    {
      "id": "passion",
      "description": "1-2 sentences: NON-OBVIOUS connection between what they love and their skills."
    },
    {
      "id": "mission",
      "description": "1-2 sentences: How their passions could serve the world."
    },
    {
      "id": "profession",
      "description": "1-2 sentences: Their marketable value - what problems can they solve for pay?"
    },
    {
      "id": "vocation",
      "description": "1-2 sentences: How to get paid while serving something larger."
    }
  ],
  
  "weeklyActions": [
    {
      "title": "Short action title (3-5 words)",
      "description": "One sentence: specific action for THIS WEEK."
    },
    {
      "title": "Short action title",
      "description": "One sentence: another micro-experiment."
    },
    {
      "title": "Short action title",
      "description": "One sentence: reflection or conversation prompt."
    }
  ],
  
  "careerPaths": [
    {
      "title": "Specific career path",
      "matchReason": "1-2 sentences: why this fits their unique combination.",
      "firstStep": "One concrete first step."
    },
    {
      "title": "Second option (can be unconventional)",
      "matchReason": "1-2 sentences: the unexpected fit.",
      "firstStep": "Concrete first step."
    },
    {
      "title": "Third option",
      "matchReason": "1-2 sentences: how this combines their traits.",
      "firstStep": "Concrete first step."
    }
  ],
  
  "blindSpot": "One clear, simple sentence pointing out something they might be avoiding or haven't considered. Be DIRECT and SPECIFIC. Use plain language a friend would use."
}

BLINDSPOT GUIDELINES - THIS IS CRITICAL:
The blindspot must be:
- Written in simple, everyday language (no jargon like "systemic avenues" or "integrating paradigms")
- About ONE specific thing they might be overlooking
- Something actionable they could actually think about
- Honest but kind - like advice from a wise friend

GOOD blindSpot examples:
- "You're drawn to creative work but haven't mentioned how you'd handle the unstable income that often comes with it."
- "You care deeply about helping individuals, but you might be underestimating how much you'd enjoy teaching groups."
- "Your skills are clearly in demand, but you seem hesitant to charge what you're worth."
- "You keep mentioning wanting independence, but all your examples involve working closely with others."

BAD blindSpot examples (NEVER do this):
- "A potential blind spot lies in fully integrating..." (too academic)
- "Consider exploring the intersection of..." (vague jargon)
- "There may be unexplored synergies between..." (meaningless corporate-speak)
- Anything that sounds like a consultant wrote it

CRITICAL ANTI-PATTERNS TO AVOID:
1. NEVER put their answers in quotation marks and list them back (e.g., "You selected 'design' and 'teaching'...")
2. NEVER start sentences with "You mentioned..." or "You selected..." or "Based on your answers..."
3. NEVER just restate what they said - SYNTHESIZE it into insight
4. NEVER use generic phrases like "making a difference" or "helping others" or "meaningful work"
5. NEVER use academic/corporate jargon like "integrating paradigms", "systemic avenues", "leveraging synergies", "holistic approach"
6. ALWAYS write like a smart friend talking over coffee, not a business consultant

GOOD EXAMPLE: "The thread connecting your choices is a drive to translate complexity into clarity - whether that's simplifying a design problem or helping someone see their situation from a new angle."

BAD EXAMPLE: "You selected 'design feedback' and 'life advice' which shows you like helping people."

TONE CHECK: Read every sentence aloud. If it sounds like a TED talk or corporate memo, rewrite it in plain English.

QUALITY CHECK before responding:
- Is the ikigaiStatement specific to THIS person, or could it apply to anyone?
- Do the insights reveal something non-obvious, or just summarize their answers?
- Are the career suggestions specific and somewhat surprising, or generic?
- Would this analysis make them feel truly SEEN and understood?
- Did you AVOID putting their answers in quotation marks?
- Is the blindSpot written in plain, simple language a friend would use?
- Could you explain each insight to a 15-year-old? If not, simplify it.

Return ONLY valid JSON.`
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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: 'application/json',
      }
    })
    
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
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }
    
    try {
      const analysis = JSON.parse(text)
      return NextResponse.json(analysis)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text.substring(0, 500))
      return NextResponse.json(
        { error: 'Failed to parse analysis', rawResponse: text.substring(0, 200) },
        { status: 500 }
      )
    }
    
  } catch (error: any) {
    console.error('Error generating analysis:', error?.message || error)
    
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
      { error: error?.message || 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}
