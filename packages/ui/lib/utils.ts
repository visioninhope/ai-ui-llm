import { type ClassValue, clsx } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ArtifactMessagePartData = {
  generating: boolean
  id: string | null
  type: string | null
  title: string | null
  content: string
  language: string | null
}

export const handleFileValidation = (files: File[]) => {
  const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('text/'))

  if (validFiles.length === files.length) {
    const dataTransfer = new DataTransfer()
    validFiles.forEach(file => dataTransfer.items.add(file))
    return dataTransfer.files
  } else {
    toast.error('Only image and text files are allowed')
    return null
  }
}

export const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
  ref.current?.scrollIntoView({ behavior: 'smooth' })
}

export const getTextFromDataUrl = (url: string): Promise<string> => {
  if (typeof window === 'undefined') {
    return Promise.resolve('Content not available during server-side rendering')
  }

  return new Promise((resolve, reject) => {
    if (url.startsWith('data:')) {
      // Handle data URL
      try {
        const [, base64] = url.split(',')
        if (!base64) {
          throw new Error('Invalid data URL content')
        }

        resolve(atob(decodeURIComponent(base64)))
      } catch (error) {
        toast.error('Error processing data URL:', error || 'Unknown error')
        reject(new Error('Failed to extract text from data URL'))
      }
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      // Handle regular URL
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.blob()
        })
        .then(blob => blob.text())
        .then(text => resolve(text))
        .catch(error => {
          reject(new Error('Failed to fetch text from URL'))
        })
    } else {
      reject(new Error('Invalid URL format'))
    }
  })
}

export type MessagePart =
  | {
      type: 'text'
      data: string
    }
  | {
      type: 'artifact'
      data: ArtifactMessagePartData
    }
  | {
      type: 'thinking'
      data: {
        content: string
        generating: boolean
      }
    }

export function parseMessage(message: string): MessagePart[] {
  const memoizedParse = memoize((msg: string) => {
    const parts: MessagePart[] = []
    let currentPart: MessagePart | null = null
    let buffer = ''
    let i = 0

    // Function to handle code blocks
    const handleCodeBlock = (startIndex: number): { content: string; endIndex: number } => {
      const codeBlockEnd = msg.indexOf('```', startIndex + 3)
      if (codeBlockEnd === -1) {
        return { content: msg.slice(startIndex), endIndex: msg.length }
      }
      return { content: msg.slice(startIndex, codeBlockEnd + 3), endIndex: codeBlockEnd + 3 }
    }

    while (i < msg.length) {
      const char = msg[i]

      if (char === '`' && msg.slice(i, i + 3) === '```') {
        if (buffer.trim()) {
          parts.push({ type: 'text', data: buffer.trim() })
          buffer = ''
        }

        const { content, endIndex } = handleCodeBlock(i)
        parts.push({ type: 'text', data: content })
        i = endIndex
      } else if (char === '<' && !currentPart) {
        if (buffer.trim()) {
          parts.push({ type: 'text', data: buffer.trim() })
          buffer = ''
        }

        const tagEnd = msg.indexOf('>', i)
        if (tagEnd === -1) {
          buffer += char
          i++
          continue
        }

        const tag = msg.slice(i + 1, tagEnd)
        if (tag.startsWith('thinking')) {
          currentPart = { type: 'thinking', data: { content: '', generating: true } }
          i = tagEnd + 1
        } else if (tag.startsWith('artifact')) {
          const data: ArtifactMessagePartData = {
            generating: true,
            id: null,
            type: null,
            title: null,
            content: '',
            language: null
          }
          const attributeRegex = /(\w+)="([^"]*)"/g
          let match
          while ((match = attributeRegex.exec(tag)) !== null) {
            const [, key, value] = match
            if (key === 'identifier') data.id = value
            else if (key === 'type') data.type = value
            else if (key === 'title') data.title = value
            else if (key === 'language') data.language = value
          }
          currentPart = { type: 'artifact', data }
          i = tagEnd + 1
        } else {
          buffer += char
          i++
        }
      } else if (currentPart) {
        const closingTag = currentPart.type === 'thinking' ? '</thinking>' : '</artifact>'
        const closingIndex = msg.indexOf(closingTag, i)

        if (closingIndex !== -1) {
          const content = msg.slice(i, closingIndex)
          if (currentPart.type === 'thinking') {
            currentPart.data.content = content.trim()
            currentPart.data.generating = false
          } else if (currentPart.type === 'artifact' && currentPart.data) {
            currentPart.data.content = content
            currentPart.data.generating = false
          }
          parts.push(currentPart)
          currentPart = null
          i = closingIndex + closingTag.length
        } else {
          // If no closing tag is found, treat the rest of the message as content
          const remainingContent = msg.slice(i)
          if (currentPart.type === 'thinking') {
            currentPart.data.content = remainingContent.trim()
            currentPart.data.generating = true
          } else if (currentPart.type === 'artifact' && currentPart.data) {
            currentPart.data.content = remainingContent
          }
          parts.push(currentPart)
          break
        }
      } else {
        buffer += char
        i++
      }
    }

    if (buffer.trim()) {
      parts.push({ type: 'text', data: buffer.trim() })
    }

    return parts
  })

  return memoizedParse(message)
}

function memoize<T>(fn: (arg: string) => T): (arg: string) => T {
  const cache = new Map<string, T>()
  return (arg: string) => {
    if (cache.has(arg)) {
      return cache.get(arg)!
    }
    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
