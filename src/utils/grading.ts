import { GoogleGenerativeAI } from '@google/generative-ai'

export type QuestionBreakdown = {
  label: string
  points: string
  expected: string
  student: string
  feedback: string
}

export type GradingResult = {
  studentName?: string
  total: string
  breakdown: QuestionBreakdown[]
}

// Mock grading for testing/demo when APIs fail
function getMockGradingResult(): GradingResult {
  return {
    studentName: "Demo Student",
    total: "85 / 100",
    breakdown: [
      {
        label: "Q1: Problem Setup",
        points: "20 / 20",
        expected: "Correctly identify variables and set up equations",
        student: "Student correctly identified all variables and set up the system of equations",
        feedback: "Perfect setup and clear variable definitions"
      },
      {
        label: "Q2: Mathematical Solution",
        points: "30 / 40", 
        expected: "Solve the system using substitution or elimination method",
        student: "Used elimination method but made an arithmetic error in step 3",
        feedback: "Good method choice, but check arithmetic in step 3: 2x + 3y should equal 14, not 16"
      },
      {
        label: "Q3: Final Answer & Units",
        points: "35 / 40",
        expected: "State final answer with correct units and reasonable check",
        student: "Final answer x=4, y=2 with units, but no verification shown",
        feedback: "Correct final values but should show substitution check to verify solution"
      }
    ]
  }
}

// Utility to add delay between requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry with exponential backoff for rate limits
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('quota') || 
                         error?.message?.includes('rate limit') ||
                         error?.status === 429
      
      if (!isRateLimit || i === maxRetries - 1) {
        throw error
      }
      
      const delayMs = baseDelay * Math.pow(2, i) + Math.random() * 1000
      console.log(`Rate limit hit, retrying in ${delayMs}ms...`)
      await delay(delayMs)
    }
  }
  throw new Error('Max retries exceeded')
}

export async function gradeAssignment(params: {
  assignmentText: string
  rubricText?: string
  customRules?: string
  images?: Array<{ data: string; mimeType: string }>
}) {
  // Check for mock mode (useful for testing without API calls)
  if (import.meta.env.VITE_USE_MOCK_GRADING === 'true') {
    await delay(2000) // Simulate API delay
    return getMockGradingResult()
  }

  // Decide who to try first:
  const preferVision = !!params.images?.length || (params.assignmentText.length < 300)
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY

  if (!geminiKey && !openaiKey) {
    throw new Error('Missing both VITE_GEMINI_API_KEY and VITE_OPENAI_API_KEY. Set at least one API key or enable mock.')
  }

  if (preferVision && openaiKey) {
    try {
      // Try GPT-4o first for vision cases
      return await gradeWithOpenAI(params, openaiKey)
    } catch (e: any) {
      console.warn('OpenAI vision grading failed, trying Gemini...', e?.message)
      if (geminiKey) return await gradeWithGemini(params, geminiKey)
      throw e
    }
  }

  // Default: try Gemini first
  if (geminiKey) {
    try {
      return await gradeWithGemini(params, geminiKey)
    } catch (e: any) {
      console.warn('Gemini grading failed, trying OpenAI...', e?.message)
      if (openaiKey) return await gradeWithOpenAI(params, openaiKey)
      throw e
    }
  }

  // Fallback if only OpenAI key is present
  return await gradeWithOpenAI(params, openaiKey!)
}

async function gradeWithGemini(params: {
  assignmentText: string
  rubricText?: string
  customRules?: string
  images?: Array<{ data: string; mimeType: string }>
}, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const modelId = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash'
  const model = genAI.getGenerativeModel({ model: modelId })

  const system = `
You are a STEM grader. Grade strictly against the rubric; if no rubric, use general guidelines:
- Each question has clear expected solution, award points per correctness, method, clarity.
- Include brief feedback on mistakes.
- If student name appears in the text, extract it.

Return STRICT JSON only in this shape:
{
  "studentName": "string | null",
  "total": "NN / NN",
  "breakdown": [
    { "label": "Q#: Title", "points": "NN / NN", "expected": "expected solution", "student": "student solution", "feedback": "what went wrong or note" }
  ]
}
No markdown, no extra commentary.
`

  const user = `
Assignment text:
${params.assignmentText}

Rubric text (empty means general guidelines):
${params.rubricText || ''}

Custom rules (optional):
${params.customRules || ''}

If diagrams influence grading, incorporate them.
`

  const parts: any[] = [{ text: system }, { text: user }]
  if (params.images?.length) {
    for (const img of params.images) {
      parts.push({
        inlineData: { data: img.data, mimeType: img.mimeType },
      })
    }
  }

  const result = await retryWithBackoff(async () => {
    return await model.generateContent(parts)
  })
  const raw = result.response.text().trim()
  const json = parseMaybeJSON(raw)
  return json as GradingResult
}

async function gradeWithOpenAI(params: {
  assignmentText: string
  rubricText?: string
  customRules?: string
  images?: Array<{ data: string; mimeType: string }>
}, apiKey: string) {
  const system = `
You are a STEM grader. Grade strictly against the rubric; if no rubric, use general guidelines:
- Each question has clear expected solution, award points per correctness, method, clarity.
- Include brief feedback on mistakes.
- If student name appears in the text, extract it.

Return STRICT JSON only in this shape:
{
  "studentName": "string | null",
  "total": "NN / NN",
  "breakdown": [
    { "label": "Q#: Title", "points": "NN / NN", "expected": "expected solution", "student": "student solution", "feedback": "what went wrong or note" }
  ]
}
No markdown, no extra commentary.
`

  const user = `
Assignment text:
${params.assignmentText}

Rubric text (empty means general guidelines):
${params.rubricText || ''}

Custom rules (optional):
${params.customRules || ''}

If diagrams influence grading, incorporate them.
`

  const messages: any[] = [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ]

  if (params.images?.length) {
    const imageContent = params.images.map(img => ({
      type: 'image_url',
      image_url: { url: `data:${img.mimeType};base64,${img.data}` }
    }))
    messages[1].content = [
      { type: 'text', text: user },
      ...imageContent
    ]
  }

  const modelId = params.images?.length ? 'gpt-4o' : 'gpt-4o-mini'
  const response = await retryWithBackoff(async () => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: 2000,
        temperature: 0.1
      })
    })
    if (!res.ok) {
      const error = await res.text()
      throw new Error(`OpenAI API error: ${res.status} ${error}`)
    }
    return await res.json()
  })

  const raw = response.choices[0].message.content.trim()
  const json = parseMaybeJSON(raw)
  return json as GradingResult
}

function parseMaybeJSON(s: string) {
  const cleaned = s
    .replace(/^```json/gm, '')
    .replace(/^```/gm, '')
    .replace(/```$/gm, '')
    .trim()
  return JSON.parse(cleaned)
}

export function inferStudentName(text: string) {
  const m = text.match(/(?:Student|Name)\s*[:\-]\s*([A-Za-z][A-Za-z\s'-]+)/i)
  return m ? m[1].trim() : undefined
}