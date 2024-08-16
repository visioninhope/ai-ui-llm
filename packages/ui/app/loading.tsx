'use client'

import Loader from '@/components/loader'
import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <motion.div
      className='flex items-center justify-center w-full h-screen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}>
      <Loader />
    </motion.div>
  )
}
