import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ArtifactMessagePartData, getTextFromDataUrl, MessagePart as MessagePartType, parseMessage } from '@/lib/utils'
import { Message } from 'ai'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BotIcon,
  BrainIcon,
  ChevronUpIcon,
  CodeIcon,
  PencilIcon,
  RefreshCwIcon,
  TrashIcon,
  UserIcon
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Loader from '../loader'
import { Markdown } from '../markdown/markdown'
import { Button } from '../ui'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  setCurrentArtifact: (data: ArtifactMessagePartData) => void
  onEditMessage: (id: string, content: string) => void
  onDeleteMessage: (id: string) => void
  onRetry: () => void
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  setCurrentArtifact,
  onEditMessage,
  onDeleteMessage,
  onRetry
}) => {
  const [attachmentContents, setAttachmentContents] = useState<{ [key: string]: string }>({})
  const debouncedMessages = useDebounce(messages, 300) // Adjust delay as needed

  useEffect(() => {
    const loadAttachmentContents = async () => {
      const contents: { [key: string]: string } = {}
      for (const message of debouncedMessages) {
        if (message.experimental_attachments) {
          for (const attachment of message.experimental_attachments) {
            if (attachment.contentType?.startsWith('text')) {
              try {
                contents[attachment.url] = await getTextFromDataUrl(attachment.url)
              } catch (error) {
                contents[attachment.url] = 'Error loading content'
              }
            }
          }
        }
      }
      setAttachmentContents(contents)
    }

    loadAttachmentContents()
  }, [debouncedMessages])

  return (
    <div className='flex-1 flex flex-col gap-4 max-w-screen-2xl w-full pt-1 my-12 '>
      {messages.map(message => {
        const parsedMessageParts = parseMessage(message.content)
        const isAssistant = message.role === 'assistant'

        return (
          <motion.div
            key={message.id}
            className={`flex items-end gap-4 px-2 py-2 w-full  ${isAssistant ? 'justify-start' : 'justify-end'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}>
            <div className={`flex-shrink-0 ${isAssistant ? 'order-first' : 'order-last'} -mb-10`}>
              <div
                className={`rounded-2xl border ${
                  isAssistant
                    ? 'border-foreground/70 bg-gradient-to-br from-[#fff7c0] via-[#8ef9f9] to-[#efa0ff] p-0.5'
                    : 'border-foreground/70 bg-primary p-0.5'
                }`}>
                {isAssistant ? (
                  <BotIcon className='w-8 h-8 bg-background/70 p-1 rounded-sm' />
                ) : (
                  <UserIcon className='w-8 h-8 bg-foreground/20 p-1 rounded-sm' />
                )}
              </div>
            </div>

            <div
              className={`flex flex-col gap-2 w-[85%] overflow-auto relative  ${
                isAssistant
                  ? 'mr-auto bg-base-100 rounded-t-3xl rounded-br-3xl rounded-bl-none'
                  : 'ml-auto bg-base-300 rounded-t-3xl rounded-bl-3xl rounded-br-none'
              } p-4 pb-8`}>
              {/* Thinking Section */}
              <ThinkingSection
                thinkingData={
                  parsedMessageParts.find(
                    (part): part is MessagePartType & { type: 'thinking' } => part.type === 'thinking'
                  )?.data
                }
              />
              {/* Message Content */}
              <div className='text-foreground flex flex-col gap-4'>
                {parsedMessageParts.map((part, index) => (
                  <MessagePart key={index} data={part} setCurrentArtifact={setCurrentArtifact} />
                ))}
              </div>
              {/* Message Attachments */}
              <div className='flex flex-row gap-2'>
                {message.experimental_attachments?.map((attachment, index) =>
                  attachment.contentType?.startsWith('image') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className='rounded-md w-40 mb-3' key={index} src={attachment.url} alt={attachment.name} />
                  ) : attachment.contentType?.startsWith('text') ? (
                    <div
                      className='text-xs w-40 h-24 overflow-hidden text-foreground border p-2 rounded-md bg-background mb-3'
                      key={index}>
                      {attachmentContents[attachment.url] || 'Loading...'}
                    </div>
                  ) : null
                )}
              </div>
              {/* Message Actions */}
              {/* coming soon */}

              <div
                className={`absolute bottom-2 flex rounded-md border border-primary/10 hover:border-primary transition-colors ease-in-out duration-500 right-2`}>
                {isAssistant && (
                  <Button variant='ghost' size='icon' onClick={onRetry} title='Retry'>
                    <RefreshCwIcon className='h-3 w-3' />
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant='ghost' size='icon' title='Edit'>
                      <PencilIcon className='h-3 w-3' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Message</DialogTitle>
                      <DialogDescription>Make changes to the message content below.</DialogDescription>
                    </DialogHeader>
                    <EditMessageForm message={message} onEditMessage={onEditMessage} />
                  </DialogContent>
                </Dialog>
                <Button variant='ghost' size='icon' onClick={() => onDeleteMessage(message.id)} title='Delete'>
                  <TrashIcon className='h-3 w-3' />
                </Button>
              </div>
            </div>
          </motion.div>
        )
      })}

      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
        <motion.div
          className='flex items-end gap-4 px-2 py-2 w-full justify-start'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          <div className='flex-shrink-0 order-first self-end -mb-10'>
            <div className='rounded-2xl border border-foreground/70 bg-gradient-to-br from-[#fff7c0] via-[#8ef9f9] to-[#efa0ff] p-1'>
              <BotIcon className='w-8 h-8 bg-background/70 p-1 rounded-sm' />
            </div>
          </div>

          <div className='flex flex-col gap-2 max-w-[60%] min-w-[200px] relative items-start mr-auto bg-foreground/5 rounded-t-3xl rounded-br-3xl rounded-bl-none p-4 pb-8'>
            <div className='text-foreground flex flex-col gap-4 justify-center items-center'>
              <Loader />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

const ThinkingSection: React.FC<{ thinkingData?: { content: string; generating: boolean } }> = ({ thinkingData }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!thinkingData) return null

  return (
    <div className='w-full mb-2'>
      <Button
        variant='ghost'
        className='w-full flex items-center justify-between p-2 text-xs text-foreground/70 hover:bg-foreground/10 rounded-md'
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className='flex items-center'>
          {thinkingData.generating ? <Loader size='xs' className='pr-4 ' /> : <BrainIcon className='w-4 h-4 mr-2' />}
          <span className='font-semibold'>{thinkingData.generating ? 'Thinking...' : 'Thoughts'}</span>
        </div>
        <ChevronUpIcon className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </Button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className='mt-2 p-2 bg-foreground/5 text-foreground/70 rounded-md text-xs text-pretty overflow-hidden'>
            <Markdown>{thinkingData.content}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MessagePart: React.FC<{
  data: MessagePartType
  setCurrentArtifact: (data: ArtifactMessagePartData) => void
}> = React.memo(({ data, setCurrentArtifact }) => {
  if (data.type === 'text') return <Markdown>{data.data}</Markdown>
  if (data.type === 'artifact')
    return (
      <motion.div
        key={data.data.id || Math.random().toString(36).substr(2, 9)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <Button
          variant='outline'
          className='flex justify-start h-fit w-fit py-0 px-0 my-2'
          onClick={() => setCurrentArtifact(data.data)}>
          <div className='w-14 h-full flex items-center justify-center border-r'>
            {data.data.generating ? <Loader size='xs' className='' /> : <CodeIcon />}
          </div>
          <div className='flex flex-col gap-0.5 items-start px-4 py-3'>
            <span className='break-words text-md font-semibold leading-tight'>{data.data?.title || 'Generating'}</span>
            <span className='opacity-70 line-clamp-1 text-xs'>{data.data?.content ? 'Click to show code' : ''}</span>
          </div>
        </Button>
      </motion.div>
    )
  return null
})

MessagePart.displayName = 'MessagePart'

const EditMessageForm: React.FC<{
  message: Message
  onEditMessage: (id: string, content: string) => void
}> = ({ message, onEditMessage }) => {
  const [editedContent, setEditedContent] = useState(message.content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onEditMessage(message.id, editedContent)
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <Textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} className='min-h-[100px]' />
      <Button type='submit'>Save Changes</Button>
    </form>
  )
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}
