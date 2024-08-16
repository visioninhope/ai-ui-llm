import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import React from 'react'
import { toast } from 'sonner'
type ThemeSwitcherProps = {
  expanded: boolean
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ expanded }) => {
  const { theme, setTheme } = useTheme()

  const handleThemeSwitch = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
    toast.success(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`)
  }

  return (
    <Button onClick={handleThemeSwitch} variant='ghost' className='w-full justify-start flex items-center px-3 py-2 '>
      {theme === 'light' ? <Moon className='flex-shrink-0' /> : <Sun className='flex-shrink-0' />}
      {expanded && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='text-sm ml-2'>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </motion.span>
      )}
    </Button>
  )
}
