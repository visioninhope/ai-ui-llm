'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { fetchSettings, updateSetting } from '@/lib/db'
import { ENV } from '@/lib/env'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, InfoIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Loading from '../loading'

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant='outline' size='icon' onClick={handleCopy}>
      <AnimatePresence mode='wait' initial={false}>
        {copied ? (
          <motion.div
            key='check'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Check className='h-4 w-4' />
          </motion.div>
        ) : (
          <motion.div
            key='copy'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <Copy className='h-4 w-4' />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [sensitiveEnvVars, setSensitiveEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSettings = async () => {
      const fetchedSettings = await fetchSettings()
      setSettings(fetchedSettings)

      // Fetch sensitive environment variables
      const response = await fetch('/api/env')
      const envVars = await response.json()
      setSensitiveEnvVars(envVars)

      setLoading(false)
    }
    loadSettings()
  }, [])

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveSettings = async () => {
    for (const [key, value] of Object.entries(settings)) {
      await updateSetting(key, value)
    }
    toast.success('Settings saved successfully')
  }

  if (loading) {
    return <Loading />
  }

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='name' className='w-1/3'>
                Name
              </Label>
              <Input
                id='name'
                placeholder='Your name'
                value={settings.user_name}
                onChange={e => handleSettingChange('user_name', e.target.value)}
                className='w-2/3'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label className='w-1/3'>Avatar</Label>
              <div className='flex items-center space-x-4 w-2/3'>
                <Avatar className='w-20 h-20'>
                  <AvatarImage src='/img/default.jpeg' alt='Profile picture' />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Button>Change Avatar</Button>
              </div>
            </div>
          </div>
        )
      case 'environment':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='artifact-renderer-url' className='w-1/3'>
                Artifact Renderer URL
              </Label>
              <Input
                id='artifact-renderer-url'
                value={settings.artifact_renderer_url || ''}
                onChange={e => handleSettingChange('artifact_renderer_url', e.target.value)}
                placeholder='http://localhost:3001'
                className='w-2/3'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='supabase-url' className='w-1/3'>
                Supabase URL (from .env)
              </Label>
              <div className='flex w-2/3 space-x-2'>
                <Input
                  id='supabase-url'
                  value={ENV.NEXT_PUBLIC_SUPABASE_URL || ''}
                  readOnly
                  className='flex-grow cursor-not-allowed'
                />
                <CopyButton text={ENV.NEXT_PUBLIC_SUPABASE_URL || ''} />
              </div>
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='supabase-anon-key' className='w-1/3'>
                Supabase Anon Key (from .env)
              </Label>
              <div className='flex w-2/3 space-x-2'>
                <Input
                  id='supabase-anon-key'
                  value={ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}
                  readOnly
                  className='flex-grow cursor-not-allowed'
                />
                <CopyButton text={ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''} />
              </div>
            </div>
          </div>
        )
      case 'ai':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='local-ai-baseurl' className='w-1/3'>
                Local AI Base URL
              </Label>
              <Input
                id='local-ai-baseurl'
                value={settings.local_ai_baseurl || ''}
                onChange={e => handleSettingChange('local_ai_baseurl', e.target.value)}
                placeholder='http://localhost:1234/v1'
                className='w-2/3'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='local-model-name' className='w-1/3'>
                Model Name
              </Label>
              <Input
                id='local-model-name'
                value={settings.local_model_name || ''}
                onChange={e => handleSettingChange('local_model_name', e.target.value)}
                placeholder='meta-llama-3.1-8B-instruct'
                className='w-2/3'
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='local-max-tokens' className='w-1/3'>
                Max Tokens
              </Label>
              <Input
                id='local-max-tokens'
                type='number'
                value={settings.local_max_tokens || ''}
                onChange={e => handleSettingChange('local_max_tokens', e.target.value)}
                placeholder='4096'
                className='w-1/4'
              />
            </div>
          </div>
        )
      case 'providers':
        return (
          <div className='space-y-8'>
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>OpenAI</h3>
              <div className='flex items-center justify-between'>
                <Label htmlFor='openai-api-key' className='w-1/3'>
                  OpenAI API Key
                </Label>
                <div className='flex w-2/3 space-x-2'>
                  <Input
                    id='openai-api-key'
                    value={sensitiveEnvVars.OPENAI_API_KEY || ''}
                    readOnly
                    className='flex-grow cursor-not-allowed'
                  />
                  <CopyButton text={sensitiveEnvVars.OPENAI_API_KEY || ''} />
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='openai-max-tokens' className='w-1/3'>
                  Max Tokens
                </Label>
                <Input
                  id='openai-max-tokens'
                  type='number'
                  value={settings.openai_max_tokens || ''}
                  onChange={e => handleSettingChange('openai_max_tokens', e.target.value)}
                  placeholder='4096'
                  className='w-1/4'
                />
              </div>
            </div>
            <div className='space-y-6'>
              <h3 className='text-lg font-semibold'>Anthropic</h3>
              <div className='flex items-center justify-between'>
                <Label htmlFor='anthropic-api-key' className='w-1/3'>
                  Anthropic API Key
                </Label>
                <div className='flex w-2/3 space-x-2'>
                  <Input
                    id='anthropic-api-key'
                    value={sensitiveEnvVars.ANTHROPIC_API_KEY || ''}
                    readOnly
                    className='flex-grow cursor-not-allowed'
                  />
                  <CopyButton text={sensitiveEnvVars.ANTHROPIC_API_KEY || ''} />
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='anthropic-max-tokens' className='w-1/3'>
                  Max Tokens
                </Label>
                <Input
                  id='anthropic-max-tokens'
                  type='number'
                  value={settings.anthropic_max_tokens || ''}
                  onChange={e => handleSettingChange('anthropic_max_tokens', e.target.value)}
                  placeholder='4096'
                  className='w-1/4'
                />
              </div>
            </div>
          </div>
        )
      case 'system-prompt':
        return (
          <div className='space-y-6'>
            <div className='flex items-center mb-4'>
              <InfoIcon className='mr-2' />
              <p className='text-sm text-gray-500'>
                We use a large system message for artifact functionality. Your custom prompt will be appended to it.
              </p>
            </div>
            <div className='flex flex-col space-y-2'>
              <Label htmlFor='system-prompt' className='mb-2'>
                Custom System Prompt
              </Label>
              <Textarea
                id='system-prompt'
                value={settings.system_prompt || ''}
                onChange={e => handleSettingChange('system_prompt', e.target.value)}
                placeholder='Enter your custom system prompt here...'
                className='min-h-[200px]'
              />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='flex items-center justify-center min-h-screen'>
      <Card className='w-full max-w-screen-2xl h-[calc(100vh*2/3)] min-h-[600px]'>
        <CardContent className='h-full flex flex-col p-12'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className='text-3xl font-bold mb-6'>
            Settings
          </motion.h1>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-grow flex flex-col'>
            <TabsList className='grid w-full grid-cols-5 mb-6'>
              {['general', 'environment', 'ai', 'providers', 'system-prompt'].map(tab => (
                <TabsTrigger key={tab} value={tab}>
                  <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </motion.span>
                </TabsTrigger>
              ))}
            </TabsList>
            <div className='flex-grow pr-4 flex items-center'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial='hidden'
                  animate='visible'
                  exit='exit'
                  transition={{ duration: 0.3 }}
                  className='w-full p-1 overflow-y-auto'>
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}>
            <Button className='mt-6 float-right' onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
