import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { fetchSettings, updateSetting } from '@/lib/db'
import { SelectProps } from '@radix-ui/react-select'
import { useEffect, useState } from 'react'
import { models } from '../app/api/chat/registry'

interface ModelSelectorProps extends SelectProps {
  className?: string
}

export function ModelSelector({ className, ...props }: ModelSelectorProps) {
  const [currentModel, setCurrentModel] = useState('')

  useEffect(() => {
    fetchSettings()
      .then(settings => {
        if (settings.current_model) {
          setCurrentModel(settings.current_model)
        }
      })
      .catch(error => console.error('Error fetching current model:', error))
  }, [])

  const handleModelChange = async (value: string) => {
    try {
      await updateSetting('current_model', value)
      setCurrentModel(value)
    } catch (error) {
      console.error('Error updating model:', error)
    }
  }

  return (
    <Select value={currentModel} onValueChange={handleModelChange} {...props}>
      <SelectTrigger
        variant='unstyled'
        id='modelselector'
        className='w-fit gap-2 px-2 text-xs hover:underline underline-offset-8 transition-all duration-500 transform hover:scale-105'>
        <SelectValue placeholder='Select a model' />
      </SelectTrigger>
      <SelectContent>
        {models.map(model => (
          <SelectItem key={model.input} value={model.input}>
            {model.displayName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
