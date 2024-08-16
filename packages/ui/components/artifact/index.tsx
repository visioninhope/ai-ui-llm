'use client'

import { HTMLArtifact } from '@/components/artifact/html'
import { ReactArtifact } from '@/components/artifact/react'
import { CodeBlock } from '@/components/markdown/code-block'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCopyToClipboard } from '@/lib/hooks/copy-to-clipboard'
import { ArtifactMessagePartData } from '@/lib/utils'
import { CheckIcon, ClipboardIcon, XIcon } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { NonMemoizedMarkdown as Markdown } from '../markdown/markdown'

type Props = {
  onClose: () => void
} & ArtifactMessagePartData

export type ArtifactMode = 'code' | 'preview'

const artifactPreviewSupportedTypes = ['text/html', 'application/react']

export const ArtifactPanel = React.memo(({ type, title, language, content, onClose, generating }: Props) => {
  const [mode, setMode] = useState<ArtifactMode>('code')
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000
  })

  const onCopy = useCallback(() => {
    if (isCopied) return
    copyToClipboard(content)
  }, [isCopied, copyToClipboard, content])

  const handleModeChange = useCallback((value: string) => {
    setMode(value as ArtifactMode)
  }, [])

  const renderContent = useMemo(() => {
    switch (type) {
      case 'text/markdown':
        return <Markdown>{content}</Markdown>
      case 'application/code':
        return language ? (
          <CodeBlock
            language={language}
            value={content}
            showHeader={false}
            className='h-full max-h-full overflow-auto'
          />
        ) : null
      case 'application/react':
        return <ReactArtifact code={content} mode={mode} />
      case 'text/html':
        return <HTMLArtifact code={content} mode={mode} />
      default:
        return null
    }
  }, [type, content, language, mode])

  return (
    <Card className='w-full border-none rounded-none flex flex-col h-full max-h-full'>
      <CardHeader className='bg-foreground/5 rounded-lg border rounded-b-none py-2 px-4 flex flex-row items-center gap-4 justify-between space-y-0'>
        <span className='font-semibold'>{title || 'Generating...'}</span>
        <div className='flex gap-2 items-center'>
          {type && artifactPreviewSupportedTypes.includes(type) && !generating && (
            <Tabs value={mode} onValueChange={handleModeChange}>
              <TabsList className='bg-background'>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
                <TabsTrigger value='code'>Code</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
          <Button onClick={onClose} size='icon' variant='ghost'>
            <XIcon className='w-4 h-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent
        id='artifact-content'
        className='border-l border-r p-0 w-full flex-1 max-h-full overflow-hidden relative'>
        {renderContent}
      </CardContent>
      <CardFooter className='bg-foreground/5 border rounded-lg rounded-t-none py-2 px-4 flex items-center flex-row-reverse gap-4'>
        <Button onClick={onCopy} size='icon' variant='outline' className='rounded-lg px-2.5'>
          {isCopied ? <CheckIcon /> : <ClipboardIcon />}
        </Button>
      </CardFooter>
    </Card>
  )
})

ArtifactPanel.displayName = 'ArtifactPanel'
