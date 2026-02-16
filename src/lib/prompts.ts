import { IkigaiSection } from './store'

interface AnalysisInput {
  answers: Record<IkigaiSection, { questionId: string; answer: string }[]>
  language?: string
}

export function buildAnalysisPrompt(input: AnalysisInput): string {
  const { answers, language = 'English' } = input
  
  const formatSection = (sectionId: IkigaiSection, title: string) => {
    const sectionAnswers = answers[sectionId]
    if (!sectionAnswers || sectionAnswers.length === 0) {
      return `### ${title}\nNo answers provided.`
    }
    return `### ${title}\n${sectionAnswers.map(a => `- ${a.answer}`).join('\n')}`
  }
  
  return `You are an expert life coach and career counselor specializing in the Japanese concept of Ikigai (生き甲斐) - the intersection of passion, mission, profession, and vocation.

A person has completed an Ikigai self-discovery questionnaire. Based on their answers below, provide a comprehensive, personalized analysis that helps them discover their purpose and potential career paths.

## USER'S ANSWERS:

${formatSection('love', 'What They Love')}

${formatSection('good-at', 'What They Are Good At')}

${formatSection('world-needs', 'What The World Needs (According to Them)')}

${formatSection('paid-for', 'What They Can Be Paid For')}

---

## ANALYSIS INSTRUCTIONS:

Please provide your analysis in ${language}. Structure your response using the following format (use markdown):

# Your Ikigai Discovery

## 1. Your Purpose Statement
Write a compelling 2-3 sentence statement that captures the essence of their unique Ikigai - where their passion, skills, values, and practical needs intersect.

## 2. The Four Pillars

### What You Love (Passion)
Analyze their passions and what brings them joy. Identify patterns and core themes.

### What You're Good At (Skills)  
Summarize their key strengths and talents. Note both obvious and hidden abilities.

### What The World Needs (Mission)
Analyze their values and how they want to contribute. Identify the impact they want to make.

### What You Can Be Paid For (Profession)
Assess their marketable skills and career interests. Note practical considerations.

## 3. The Sweet Spots (Intersections)

### Your Passion (Love + Good At)
Where their joy meets their abilities.

### Your Mission (Love + World Needs)  
Where their joy meets their desire to contribute.

### Your Profession (Good At + Paid For)
Where their abilities meet market demand.

### Your Vocation (World Needs + Paid For)
Where contribution meets compensation.

## 4. Career Path Recommendations

Suggest 3-5 specific career paths, roles, or business ideas that align with their Ikigai. For each:
- **Role/Path Name**
- Why it fits their profile
- First steps to explore this path

## 5. Action Plan

Provide 5-7 concrete action steps they can take in the next 30 days to move toward their Ikigai. Be specific and actionable.

## 6. Potential Challenges

Identify 2-3 potential obstacles they might face and how to overcome them.

## 7. Final Reflection

End with an inspiring paragraph that acknowledges their unique journey and potential.

---

Remember: Be warm, encouraging, and specific. Use their actual words and examples when possible. Avoid generic advice - make this feel personal to them. Do NOT use emojis anywhere in your response.`
}
