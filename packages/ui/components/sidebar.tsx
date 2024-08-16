'use client'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { fetchChatSessions } from '@/lib/db'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bot, MessageSquare, PenSquare, SettingsIcon, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button, buttonVariants } from './ui/button'

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30
}

interface ChatSession {
  id: string
  title: string
  updated_at: string
}

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    const loadChatSessions = async () => {
      const sessions = await fetchChatSessions()
      setChatSessions(sessions)
    }

    loadChatSessions()

    const subscription = supabase
      .channel('public:chat_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions' }, loadChatSessions)
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id)

    if (error) {
      toast.error(`Error deleting chat session: ${error.message}`)
    } else {
      setChatSessions(chatSessions.filter(session => session.id !== id))
      if (params.id === id) {
        router.push('/chat')
      }
    }
  }

  const SidebarLink = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors w-full',
        href === `/chat/${params.id}` ? 'bg-background/70' : 'hover:bg-foreground/5'
      )}>
      <Icon className={cn('flex-shrink-0 w-5 h-5 ', !isExpanded && 'mx-auto')} />
      {isExpanded && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='text-sm'>
          {label}
        </motion.span>
      )}
    </Link>
  )

  const ChatItem = ({ id, title }: { id: string; title: string }) => (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-md transition-colors w-full',
        id === params.id ? 'bg-foreground/5' : 'hover:bg-foreground/10'
      )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/chat/${id}`} className='flex items-center gap-2 flex-1 min-w-0'>
              <MessageSquare className='h-5 w-5 flex-shrink-0' />
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='text-sm truncate'>
                  {title}
                </motion.span>
              )}
            </Link>
          </TooltipTrigger>
          <TooltipContent side='right' align='start'>
            <p className='max-w-xs break-words'>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {isExpanded && (
        <Button variant='ghost' size='icon' onClick={() => deleteSession(id)}>
          <Trash2 className='h-4 w-4' />
        </Button>
      )}
    </div>
  )

  return (
    <div className='flex h-screen'>
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 240 : 60
        }}
        transition={spring}
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setTimeout(() => setIsExpanded(false), 200)}
        className='flex flex-col h-full bg-base-100'>
        {/* logo */}
        <Link href='/'>
          <div className='flex items-center justify-center p-4 h-14'>
            <div className='h-8 w-8 flex items-center justify-center rounded-full flex-shrink-0 bg-gradient-to-br from-[#fff7c0] via-[#8ef9f9] to-[#efa0ff]'>
              <Bot className='w-7 h-7 bg-base-200 p-1 rounded-full' />
            </div>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='ml-2 font-bold text-xl whitespace-nowrap'>
                AI UI
              </motion.span>
            )}
          </div>
        </Link>
        <div className='flex-1 overflow-y-auto px-2 py-4 space-y-2'>
          <SidebarLink href='/chat' icon={PenSquare} label='New Chat' />
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='mt-4 space-y-1'>
              <h3 className='text-sm font-semibold mt-6 px-2'>Recent Chats</h3>
              {chatSessions.map(session => (
                <ChatItem key={session.id} id={session.id} title={session.title} />
              ))}
            </motion.div>
          )}
        </div>

        <div className='p-2 space-y-1'>
          <Link
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full justify-start flex items-center px-3 py-2')}
            href={'/settings'}>
            <SettingsIcon className='flex-shrink-0' />
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className='text-sm ml-2'>
                {isExpanded === true ? 'Settings' : ''}
              </motion.span>
            )}
          </Link>

          <ThemeSwitcher expanded={isExpanded} />
        </div>
      </motion.div>
      <div className='flex-1 overflow-hidden bg-base-100'>
        <div className='flex-1 overflow-hidden bg-gradient-to-r from-background via-base-300 to-background border-[12px] rounded-[3rem] border-base-100 max-h-screen'>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
