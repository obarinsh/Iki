import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 })
    }
    
    // Try to fetch available models directly from Google API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    )
    
    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json({ 
        error: 'Failed to fetch models',
        details: error,
        status: response.status 
      }, { status: response.status })
    }
    
    const data = await response.json()
    
    // Extract just the model names that support generateContent
    const models = data.models
      ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
      ?.map((m: any) => ({
        name: m.name,
        displayName: m.displayName,
        methods: m.supportedGenerationMethods
      }))
    
    return NextResponse.json({ 
      models,
      total: models?.length || 0,
      apiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 8) + '...'
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
