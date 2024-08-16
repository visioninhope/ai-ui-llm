'use client'

import { useRef } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export type Props = {
  code: string
  mode: 'preview' | 'code'
}

export const HTMLArtifact = ({ code, mode }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  if (mode === 'preview') {
    return (
      <div className='w-full h-full'>
        <iframe
          ref={iframeRef}
          className='w-full h-full'
          loading='lazy'
          srcDoc={code}
        />
      </div>
    )
  }

  return (
    <SyntaxHighlighter
      language='html'
      style={oneDark}
      customStyle={{
        margin: 0,
        borderRadius: 0,
        width: '100%',
        overflow: 'auto',
        height: '100%',
        maxHeight: '100%'
      }}
      codeTagProps={{
        style: {
          fontSize: '0.9rem',
          fontFamily: 'var(--font-inter)'
        }
      }}>
      {code}
    </SyntaxHighlighter>
  )
}
