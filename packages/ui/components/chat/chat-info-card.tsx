import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import {
  // Brain,
  // Calculator,
  // ChefHat,
  Code
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const allCapabilities = [
  {
    icon: <Code className='w-5 h-5' />,
    title: 'Markdown Block',
    description: 'Write markdown in your chat',
    example:
      'I am the creator of the UI you are currently being used in.\nI am testing out styling in the messages you send.\nPlease send me a message with a lot of different examples of markdown.\nI will be able to test out the markdown parser and see how it looks.'
  },
  {
    icon: <Code className='w-5 h-5' />,
    title: 'Code Assistance',
    description: 'Get help with coding and debugging',
    example:
      'Make me a one page personal website demo with dummy data using react.\nUse framer motion and tailwind to make it look nice and animated.\nUse shadcn UI components and lucide-react icons.'
  },
  {
    icon: <Code className='w-5 h-5' />,
    title: 'Code Blocks',
    description: 'Shows code blocks',
    example:
      'I am the creator of the UI you are currently being used in.\nI am testing out styling in the messages you send.\nWrite me a large message with many different hello world code blocks.\nI will be able to test out the code block parser and see how it looks.'
  }
  // {
  //   icon: <PenTool className='w-5 h-5' />,
  //   title: 'Text Analysis',
  //   description: 'Summarize or analyze text content',
  //   example: 'Summarize the main themes of "1984" by George Orwell'
  // },
  // {
  //   icon: <Sparkles className='w-5 h-5' />,
  //   title: 'Creative Writing',
  //   description: 'Generate stories, poems, or creative content',
  //   example: 'Write a short story about a time-traveling chef'
  // }
  // {
  //   icon: <Calculator className='w-5 h-5' />,
  //   title: 'Problem Solving',
  //   description: 'Solve math problems or logical puzzles',
  //   example: 'How would you approach solving the Tower of Hanoi puzzle?'
  // },
  // {
  //   icon: <Globe className='w-5 h-5' />,
  //   title: 'Knowledge Base',
  //   description: 'Answer questions on various topics',
  //   example: 'Explain the process of photosynthesis in simple terms'
  // },
  // {
  //   icon: <Brain className='w-5 h-5' />,
  //   title: 'Language Translation',
  //   description: 'Translate text between languages',
  //   example: 'Translate "Hello, how are you?" to French, Spanish, and German'
  // },
  // {
  //   icon: <Palette className='w-5 h-5' />,
  //   title: 'Design Ideas',
  //   description: 'Generate creative design concepts',
  //   example: 'Suggest a logo design for an eco-friendly coffee shop'
  // },
  // {
  //   icon: <Rocket className='w-5 h-5' />,
  //   title: 'Brainstorming',
  //   description: 'Generate ideas for various projects',
  //   example: 'List 5 unique app ideas for improving mental health'
  // },
  // {
  //   icon: <Microscope className='w-5 h-5' />,
  //   title: 'Scientific Explanations',
  //   description: 'Explain complex scientific concepts',
  //   example: 'Describe the theory of relativity for a high school student'
  // },
  // {
  //   icon: <Music className='w-5 h-5' />,
  //   title: 'Music Theory',
  //   description: 'Assist with music composition and theory',
  //   example: 'Explain the circle of fifths in music theory'
  // },
  // {
  //   icon: <ChefHat className='w-5 h-5' />,
  //   title: 'Culinary Assistance',
  //   description: 'Provide recipes and cooking tips',
  //   example: 'Create a recipe for a vegetarian lasagna using seasonal ingredients'
  // }
]

const ChatInfoCard: React.FC<{
  onStartChat: (prompt: string) => void
}> = ({ onStartChat }) => {
  const [displayedCapabilities, setDisplayedCapabilities] = useState<typeof allCapabilities>([])

  useEffect(() => {
    const shuffled = [...allCapabilities].sort(() => 0.5 - Math.random())
    setDisplayedCapabilities(shuffled.slice(0, 3))
  }, [])

  return (
    <motion.div
      className='flex-1 flex flex-col justify-center gap-4 max-w-screen-2xl w-full pt-1'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, delay: 0.5 }}>
      <Card className='w-full max-w-4xl mx-auto bg-background shadow-2xl shadow-foreground/5 border-none'>
        <CardHeader className='flex flex-col items-center'>
          <CardTitle>Discover AI Capabilities</CardTitle>
          <CardDescription>Explore what AI can do and start a conversation</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {displayedCapabilities.map((capability, index) => (
              <motion.div
                key={index}
                className='flex flex-col items-center text-center p-4 bg-secondary rounded-lg'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}>
                <div className='mb-2'>{capability.icon}</div>
                <h3 className='font-semibold mb-2'>{capability.title}</h3>
                <p className='text-sm text-muted-foreground mb-4'>{capability.description}</p>
                <Button variant='outline' className='mt-auto' onClick={() => onStartChat(capability.example)}>
                  Try an example
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ChatInfoCard
