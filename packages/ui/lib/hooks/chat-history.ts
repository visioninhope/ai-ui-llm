import { fetchChatHistory } from '@/lib/db'
import { getTextFromDataUrl } from '@/lib/utils'
import { Message } from 'ai'
import { useCallback } from 'react'
import { toast } from 'sonner'

export const useChatHistory = (
  setMessages: (messages: Message[]) => void,
  setIsInitialLoading: (loading: boolean) => void
) => {
  const loadChatHistory = useCallback(
    async (id: string) => {
      try {
        const chatHistory = await fetchChatHistory(id)
        const messagesWithAttachments = await Promise.all(
          chatHistory.map(async msg => {
            if (msg.experimental_attachments) {
              const loadedAttachments = await Promise.all(
                msg.experimental_attachments.map(async (attachment: { contentType: string; url: any }) => {
                  if (attachment.contentType?.startsWith('text')) {
                    try {
                      const content = await getTextFromDataUrl(attachment.url)
                      return { ...attachment, content }
                    } catch (error) {
                      return attachment
                    }
                  }
                  return attachment
                })
              )
              return { ...msg, experimental_attachments: loadedAttachments }
            }
            return msg
          })
        )
        setMessages(messagesWithAttachments)
      } catch (error) {
        toast.error('Failed to load chat history. Starting a new chat.')
      } finally {
        setIsInitialLoading(false)
      }
    },
    [setMessages, setIsInitialLoading]
  )

  return loadChatHistory
}
