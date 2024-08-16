import Loading from '@/app/loading'
import ChatUI from '@/components/chat'
import { Suspense } from 'react'

export default function ChatPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ChatUI />
    </Suspense>
  )
}
