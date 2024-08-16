'use client'

import { Attachment, fetchChatSessions, saveChatHistory } from '@/lib/db'
import { useChatHistory, useMessageActions } from '@/lib/hooks'
import { ArtifactMessagePartData } from '@/lib/utils'
import { generateId } from 'ai'
import { useChat } from 'ai/react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ArtifactPanel } from '../artifact'
import ChatInfoCard from './chat-info-card'
import { DragDropContainer } from './drag-drop-overlay'
import { InputArea } from './input-area'

const MessageList = dynamic(() => import('./message-list').then(mod => mod.MessageList), { ssr: false })

export default function ChatUI() {
  const router = useRouter()
  const params = useParams()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [totalTokens, setTotalTokens] = useState(0)

  const { messages, setMessages, input, handleSubmit, handleInputChange, isLoading, stop, setInput, reload } = useChat({
    id: sessionId || undefined,
    body: { sessionId },
    onResponse: async response => {
      if (sessionId) {
        try {
          await saveChatHistory(
            sessionId,
            messages
              .filter(msg => msg.role === 'user' || msg.role === 'assistant')
              .map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                experimental_attachments: msg.experimental_attachments as (Attachment | File)[] | undefined
              })),
            totalTokens
          )
        } catch (error) {
          toast.error('Failed to save chat history. Please try again.')
        }
      }
    },
    onError: () => toast.error('Something went wrong, please try again later!'),
    keepLastMessageOnError: true
  })

  const { handleEditMessage, handleDeleteMessage, handleRetry } = useMessageActions(
    sessionId,
    messages,
    setMessages,
    reload,
    totalTokens
  )

  const [files, setFiles] = useState<FileList | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [currentArtifact, setCurrentArtifact] = useState<ArtifactMessagePartData | null>(null)

  const loadChatHistory = useChatHistory(setMessages, setIsInitialLoading)

  useEffect(() => {
    if (typeof params.id === 'string') {
      setSessionId(params.id)
      loadChatHistory(params.id)
    } else {
      const newSessionId = generateId(6)
      setSessionId(newSessionId)
      router.push(`/chat/${newSessionId}`)
      setIsInitialLoading(false)
    }
  }, [params.id, router, loadChatHistory])

  const handleFilesAdded = (newFiles: FileList) => {
    setFiles(prevFiles => {
      if (!prevFiles) return newFiles
      const combinedFiles = new DataTransfer()
      Array.from(prevFiles).forEach(file => combinedFiles.items.add(file))
      Array.from(newFiles).forEach(file => combinedFiles.items.add(file))
      return combinedFiles.files
    })
  }

  const handleStartChat = (prompt: string) => {
    setInput(prompt)
  }

  const artifactPanel = useMemo(() => {
    if (!currentArtifact) return null

    return <ArtifactPanel {...currentArtifact} onClose={() => setCurrentArtifact(null)} />
  }, [currentArtifact])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>, options?: { experimental_attachments?: FileList }) => {
    e.preventDefault()
    if (!sessionId) {
      return
    }

    const newMessage = {
      role: 'user' as const,
      content: input,
      experimental_attachments: options?.experimental_attachments
        ? Array.from(options.experimental_attachments)
        : undefined
    }

    const updatedMessages = [...messages, newMessage]

    handleSubmit(e, options)

    if (options?.experimental_attachments) {
      setFiles(null)
    }

    try {
      saveChatHistory(
        sessionId,
        updatedMessages
          .filter(msg => msg.role === 'user' || msg.role === 'assistant')
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            experimental_attachments: msg.experimental_attachments as (Attachment | File)[] | undefined
          })),
        totalTokens
      )
    } catch (error) {
      toast.error('Failed to save chat history. Please try again.')
    }
  }

  useEffect(() => {
    const fetchTokenUsage = async () => {
      if (sessionId) {
        const sessions = await fetchChatSessions()
        const currentSession = sessions.find(session => session.id === sessionId)
        if (currentSession) {
          setTotalTokens(currentSession.usage || 0)
        }
      }
    }

    fetchTokenUsage()
  }, [sessionId, messages])

  return (
    <DragDropContainer onFilesAdded={handleFilesAdded}>
      <motion.div
        layout
        className='flex gap-4 w-full h-screen overflow-y-auto px-2 pl-0 '
        animate={{ width: currentArtifact ? '60%' : '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        ref={messagesEndRef}>
        <div className='relative mx-auto flex h-full w-full min-w-[400px] max-w-5xl flex-1 flex-col md:px-2'>
          <AnimatePresence>
            {messages.length > 0 ? (
              <MessageList
                messages={messages}
                isLoading={isLoading}
                setCurrentArtifact={setCurrentArtifact}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onRetry={handleRetry}
              />
            ) : (
              <ChatInfoCard onStartChat={handleStartChat} />
            )}
          </AnimatePresence>

          <InputArea
            input={input}
            files={files}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            setFiles={setFiles}
            stop={stop}
            disabled={isLoading}
            isLoading={isLoading}
            usage={totalTokens}
            sessionId={sessionId}
          />
        </div>
      </motion.div>
      <motion.div
        layout
        className='h-screen overflow-hidden'
        animate={{ width: currentArtifact ? '40%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}>
        <AnimatePresence>
          {currentArtifact && (
            <motion.div
              className='w-full h-full p-6'
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}>
              {artifactPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DragDropContainer>
  )
}
