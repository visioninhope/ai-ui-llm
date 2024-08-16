'use client'
import Loader from '@/components/loader'

export default function Home() {
  return (
    <div className='flex h-full w-full flex-col items-center justify-center gap-4 p-4'>
      <div className='flex w-full flex-col items-center justify-center gap-4'>
        <Loader size='xl' />
      </div>
    </div>
  )
}
