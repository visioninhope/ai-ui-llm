import { Attachment, deleteChatSession, saveChatHistory } from '@/lib/db'
import { Message } from 'ai'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'

export function useMessageActions(
  sessionId: string | null,
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  reload: () => void,
  totalTokens: number // Add totalTokens parameter
) {
  const router = useRouter()
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)

  const handleEditMessage = useCallback(
    async (id: string, content: string) => {
      if (!sessionId) {
        toast.error('No active session')
        return
      }
      try {
        const editIndex = messages.findIndex(message => message.id === id)
        if (editIndex === -1) {
          toast.error('Message not found')
          return
        }
        const updatedMessages = messages.slice(0, editIndex + 1)
        updatedMessages[editIndex] = { ...updatedMessages[editIndex], content }
        setMessages(updatedMessages)
        await saveChatHistory(
          sessionId,
          updatedMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            experimental_attachments: msg.experimental_attachments as (Attachment | File)[] | undefined
          })),
          totalTokens // Pass totalTokens
        )

        // Only trigger reload if the edited message is from the user
        if (updatedMessages[editIndex].role === 'user') {
          reload()
        }
      } catch (error) {
        toast.error('Failed to edit message. Please try again.')
      }
    },
    [sessionId, messages, setMessages, reload, totalTokens] // Add totalTokens to dependencies
  )

  const handleDeleteMessage = useCallback(
    async (id: string) => {
      if (!sessionId) {
        toast.error('No active session')
        return
      }
      try {
        const updatedMessages = messages.filter(message => message.id !== id)
        setMessages(updatedMessages)

        if (updatedMessages.length === 0) {
          // Delete the entire chat session if all messages are deleted
          await deleteChatSession(sessionId)
          router.push('/chat')
          toast.success('Chat session deleted')
        } else {
          await saveChatHistory(
            sessionId,
            updatedMessages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              experimental_attachments: msg.experimental_attachments as (Attachment | File)[] | undefined
            })),
            totalTokens // Pass totalTokens
          )
          toast.success('Message deleted successfully')
        }
      } catch (error) {
        toast.error('Failed to delete message. Please try again.')
      }
    },
    [sessionId, messages, setMessages, router, totalTokens] // Add totalTokens to dependencies
  )

  const handleRetry = useCallback(async () => {
    if (!sessionId) {
      toast.error('No active session')
      return
    }
    try {
      const lastUserMessageIndex = messages.findLastIndex(message => message.role === 'user')
      if (lastUserMessageIndex === -1) {
        toast.error('No user message to retry')
        return
      }
      const messagesToKeep = messages.slice(0, lastUserMessageIndex + 1)
      setMessages(messagesToKeep)
      await saveChatHistory(
        sessionId,
        messagesToKeep.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          experimental_attachments: msg.experimental_attachments as (Attachment | File)[] | undefined
        })),
        totalTokens // Pass totalTokens
      )
      reload()
    } catch (error) {
      toast.error('Failed to retry. Please try again.')
    }
  }, [sessionId, messages, setMessages, reload, totalTokens]) // Add totalTokens to dependencies

  const openEditDialog = useCallback((message: Message) => {
    setEditingMessage(message)
  }, [])

  const closeEditDialog = useCallback(() => {
    setEditingMessage(null)
  }, [])

  return useMemo(
    () => ({
      handleEditMessage,
      handleDeleteMessage,
      handleRetry,
      editingMessage,
      openEditDialog,
      closeEditDialog
    }),
    [handleEditMessage, handleDeleteMessage, handleRetry, editingMessage, openEditDialog, closeEditDialog]
  )
}
