import { fetchSettings, saveChatHistory } from '@/lib/db'
import { convertToCoreMessages, streamText } from 'ai'
import { toast } from 'sonner'
import { ArtifactSystemPrompt } from './artifact-system-prompt'
import { registry } from './registry'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json()
    const settings = await fetchSettings()
    const currentModel = settings.current_model || 'openai:gpt-4o-mini'

    const userMessages = messages.map((message: any) => ({
      role: 'user',
      content: message.content
    }))

    const result = await streamText({
      model: registry.languageModel(currentModel),
      messages: convertToCoreMessages(messages),
      temperature: 0.8,
      system: `${ArtifactSystemPrompt} ${settings.system_prompt}`,
      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        const assistantMessage = {
          role: 'assistant',
          content: text
        }
        await saveChatHistory(sessionId, [...userMessages, assistantMessage], usage?.totalTokens)
      }
    })

    return result.toDataStreamResponse()
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`Error in chat route: ${error.message} || unknown`)
    }
  }
}
