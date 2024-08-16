import NumberTicker from '@/components/magicui/number-ticker'
import { ArrowRightIcon, CircleStopIcon, InfoIcon } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { toast } from 'sonner'
import { ModelSelector } from '../model-selector'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { FilePreview } from './file-preview'

interface InputAreaProps {
  input: string
  files: FileList | null
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, options?: { experimental_attachments?: FileList }) => void
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>
  stop: () => void
  disabled: boolean
  isLoading: boolean
  usage: number
  sessionId: string | null
}

export const InputArea: React.FC<InputAreaProps> = ({
  input,
  files,
  handleInputChange,
  handleSubmit,
  setFiles,
  stop,
  disabled,
  isLoading,
  usage,
  sessionId
}) => {
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const modelSelectorRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
        }
        closeTimeoutRef.current = setTimeout(() => {
          setIsModelSelectorOpen(false)
        }, 200)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [modelSelectorRef])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModelSelectorOpen(!isModelSelectorOpen)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sessionId) {
      toast.error('No active session')
      return
    }
    const options = files ? { experimental_attachments: files } : undefined
    handleSubmit(event, options)
    setFiles(null)
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading) {
      stop()
    } else {
      event.preventDefault()
      onSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit(event as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  return (
    <div className='sticky bottom-4 mx-auto w-full flex flex-col items-center z-50'>
      <div className='relative w-full max-w-5xl flex items-center'>
        <form
          className='w-full pt-8 flex flex-col gap-1 bg-background p-3.5 pl-4 rounded-3xl border border-foreground/5 border-b-0 rounded-b-none shadow-2xl shadow-foreground/20'
          onSubmit={onSubmit}>
          <div className='relative flex gap-2 items-start'>
            <div className='relative mr-16 w-full'>
              <Textarea
                ref={inputRef}
                className='min-h-16 max-h-96 overflow-auto w-full bg-transparent border-none resize-none text-justify focus-within:outline-none pl-4 dynamic-cursor'
                placeholder='Send a message...'
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                rows={1}
              />
            </div>

            <Button
              className='aspect-square'
              variant={isLoading ? 'destructive' : 'default'}
              onClick={handleButtonClick}
              size='icon'>
              {isLoading ? <CircleStopIcon /> : <ArrowRightIcon />}
            </Button>
          </div>
          <Separator className='my-2 bg-gradient-to-r from-background via-secondary to-background' />
          <div className='flex flex-row justify-between align-bottom px-2 '>
            <ModelSelector />
            {files && files.length > 0 && <FilePreview files={files} />}
            <div className='text-xs flex gap-2 items-end'>
              <p>Tokens: </p>
              <NumberTicker className='tabular-nums' value={usage} />
              <Popover>
                <PopoverTrigger>
                  <InfoIcon className='w-4 h-4 text-muted-foreground' />
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='flex gap-2 mb-2 '>
                    <InfoIcon className='w-4 h-4 text-muted-foreground ' />
                    <p className='text-xs'>Please note:</p>
                  </div>
                  <p className='text-xs'>
                    Keep in mind that even short messages can consume a significant number of tokens due to the base
                    artifact system prompt, which is approximately 3700 tokens long.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
