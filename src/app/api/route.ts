import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

const LM_URL = process.env.LM_STUDIO_URL
const LM_KEY = process.env.LM_API_KEY

export async function POST(request: NextRequest) {
  const cookieToken = request.cookies.get('token')?.value || null
  if (!cookieToken) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  const payload: any = verifyToken(cookieToken)
  if (!payload) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { message } = await request.json()
  if (!message) return NextResponse.json({ error: 'Missing message' }, { status: 400 })

  // save user message
  await prisma.message.create({ data: { userId: payload.id, role: 'user', content: message } })

  // Advanced prompt engineering for better mental wellness support
  const messages = [
    {
      role: "system",
      content: `You are Seviyan, an empathetic mental wellness assistant designed to support students.

Key traits:
- Empathetic and understanding
- Solution-focused but not dismissive of feelings
- Professional yet warm and friendly
- Provides actionable, manageable steps
- Uses positive, encouraging language
- Recognizes severity and suggests professional help when needed

Guidelines:
- First validate feelings, then offer practical suggestions
- Keep responses concise but warm
- Focus on small, manageable steps
- Note you're an AI when discussing serious issues

If you detect crisis signs, prioritize suggesting professional help.`
    },
    {
      role: "user",
      content: message
    }
  ]

  if (!LM_URL) return NextResponse.json({ error: 'LM not configured' }, { status: 500 })

  const resp = await fetch(LM_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(LM_KEY ? { Authorization: `Bearer ${LM_KEY}` } : {}),
    },
    body: JSON.stringify({ 
      messages,
      temperature: 0.7,
      max_tokens: 400,
      stream: false
    }),
  })

  if (!resp.ok) return NextResponse.json({ error: 'LM error' }, { status: 502 })
  const data = await resp.json()
  const text = data.choices?.[0]?.message?.content || data.output || data.text || JSON.stringify(data)

  // save assistant message
  await prisma.message.create({ data: { userId: payload.id, role: 'assistant', content: text } })

  return NextResponse.json({ reply: text })
}