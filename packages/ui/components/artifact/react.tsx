'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export type Props = {
  code: string
  mode: 'preview' | 'code'
}

export const ReactArtifact = ({ code, mode }: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const handleRender = useCallback(() => {
    if (!iframeRef.current?.contentWindow) return

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'UPDATE_COMPONENT',
        code
      },
      '*'
    )
  }, [code])

  useEffect(() => {
    const handleMessage = (event: any) => {
      if (event?.data?.type === 'INIT_COMPLETE') {
        setIframeLoaded(true)
        handleRender()
      }
    }

    window.addEventListener('message', handleMessage)

    return () => window.removeEventListener('message', handleMessage)
  }, [handleRender])

  useEffect(() => {
    handleRender()
  }, [handleRender])

  if (mode === 'preview') {
    return (
      <div className='w-full h-full'>
        <iframe
          ref={iframeRef}
          src={process.env.NEXT_PUBLIC_ARTIFACT_RENDERER_URL}
          className='w-full h-full'
          loading='lazy'
        />
      </div>
    )
  }

  return (
    <SyntaxHighlighter
      language='tsx'
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
