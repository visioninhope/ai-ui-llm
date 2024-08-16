'use client'

import { getReactComponentFromCode } from '@/lib/utils'
import * as React from 'react'
import { useEffect, useState } from 'react'
import Loading from './loading'

export default function Home() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    window.parent.postMessage({ type: 'INIT_COMPLETE' }, '*')

    const handleMessage = (event: any) => {
      if (event?.data?.type === 'UPDATE_COMPONENT') {
        setIsLoading(true)
        try {
          const newComponent = getReactComponentFromCode(event?.data?.code || '')
          if (newComponent) {
            setComponent(() => newComponent)
          }
        } catch (error) {
          console.error('Error evaluating component code:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    setIsLoading(false)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return <div>{Component ? React.createElement(Component) : null}</div>
}
