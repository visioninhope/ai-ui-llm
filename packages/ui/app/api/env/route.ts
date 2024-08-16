import { NextResponse } from 'next/server'

export async function GET() {
  const sensitiveEnvVars = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY
  }

  return NextResponse.json(sensitiveEnvVars)
}
