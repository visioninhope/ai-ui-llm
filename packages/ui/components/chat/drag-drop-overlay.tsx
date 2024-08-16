// src/components/DragDropContainer.tsx
import { handleFileValidation } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudUpload } from 'lucide-react'
import React, { DragEvent, useState } from 'react'

interface DragDropContainerProps {
  children: React.ReactNode
  onFilesAdded: (files: FileList) => void
}

export const DragDropContainer: React.FC<DragDropContainerProps> = ({ children, onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = event.dataTransfer.files
    const droppedFilesArray = Array.from(droppedFiles)
    if (droppedFilesArray.length > 0) {
      const validFiles = handleFileValidation(droppedFilesArray)
      if (validFiles) onFilesAdded(validFiles)
    }
    setIsDragging(false)
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items

    if (items) {
      const pastedFiles = Array.from(items)
        .map(item => item.getAsFile())
        .filter((file): file is File => file !== null)

      if (pastedFiles.length > 0) {
        const validFiles = handleFileValidation(pastedFiles)
        if (validFiles) onFilesAdded(validFiles)
      }
    }
  }

  return (
    <div
      className='flex min-h-screen w-full max-h-screen overflow-hidden'
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}>
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className='fixed pointer-events-none bg-background/95 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <CloudUpload className='text-foreground py-4' size={256} />
            <h1 className='text-3xl py-4'>Drag and drop files here</h1>
            <div className='text-lg text-foreground'>{'(images or text)'}</div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}
