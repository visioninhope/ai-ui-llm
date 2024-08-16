'use client'

import { useCopyToClipboard } from '@/lib/hooks/copy-to-clipboard'
import { Check, Copy, Download } from 'lucide-react'
import React, { useCallback } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { twMerge } from 'tailwind-merge'
import { Button } from '../ui'

interface Props {
  language: string
  value: string
  showHeader?: boolean
  className?: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: '.js',
  python: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  'c++': '.cpp',
  'c#': '.cs',
  ruby: '.rb',
  php: '.php',
  swift: '.swift',
  'objective-c': '.m',
  kotlin: '.kt',
  typescript: '.ts',
  go: '.go',
  perl: '.pl',
  rust: '.rs',
  scala: '.scala',
  haskell: '.hs',
  lua: '.lua',
  shell: '.sh',
  sql: '.sql',
  html: '.html',
  css: '.css'
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

const CodeBlock: React.FC<Props> = React.memo(({ language, value, showHeader = true, className = '' }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000
  })

  const onCopy = useCallback(() => {
    if (!isCopied) {
      copyToClipboard(value)
    }
  }, [isCopied, copyToClipboard, value])

  const downloadAsFile = useCallback(() => {
    const fileExtension = programmingLanguages[language] || '.file'
    const suggestedFileName = `file-${generateRandomString(3, true)}${fileExtension}`
    const fileName = window.prompt('Enter file name', suggestedFileName)

    if (!fileName) {
      return
    }

    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [language, value])

  return (
    <div className={twMerge('relative w-full font-sans overflow-hidden', className)}>
      {showHeader && (
        <div className='flex items-center justify-between bg-secondary px-4 py-1 mb-0 w-full rounded-t-lg'>
          <span className='text-xs lowercase text-foreground'>{language}</span>
          <div className='flex items-center gap-2'>
            <Button aria-label='Copy code' variant='ghost' size='sm' onClick={onCopy}>
              {isCopied ? (
                <Check className='size-3 mr-2' aria-hidden='true' />
              ) : (
                <Copy className='size-3 mr-2' aria-hidden='true' />
              )}
              {isCopied ? 'Copied!' : 'Copy code'}
            </Button>
            <Button aria-label='Download code' variant='ghost' size='sm' onClick={downloadAsFile}>
              <Download className='size-4' aria-hidden='true' />
            </Button>
          </div>
        </div>
      )}

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        PreTag='div'
        showLineNumbers
        wrapLines
        wrapLongLines
        customStyle={{
          margin: 0,
          width: '100%',
          padding: '1.5rem 1rem',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px'
        }}
        codeTagProps={{
          style: {
            fontSize: '0.9rem',
            fontFamily: 'var(--font-inter)'
          }
        }}>
        {value}
      </SyntaxHighlighter>
    </div>
  )
})

CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
