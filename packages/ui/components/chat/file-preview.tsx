/* eslint-disable @next/next/no-img-element */
import { FileIcon, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '../ui'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'

interface FilePreviewProps {
  files: FileList
}

const FilePreviewItem: React.FC<{ file: File }> = ({ file }) => {
  const [content, setContent] = useState<string>('')

  const handleClick = () => {
    if (file.type.startsWith('text')) {
      const reader = new FileReader()
      reader.onload = e => {
        const text = e.target?.result
        setContent(typeof text === 'string' ? text : '')
      }
      reader.readAsText(file)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className='flex flex-col items-center justify-center h-24 w-24 border-2 p-2 rounded-lg cursor-pointer hover:bg-secondary transition-color hover:scale-105 duration-300 ease-in-out'
          onClick={handleClick}>
          <div className='flex items-center justify-center h-16 w-16'>
            {file.type.startsWith('image') ? <ImageIcon size={32} /> : <FileIcon size={32} />}
          </div>
          <p className='text-foreground text-xs pt-2 text-ellipsis text-nowrap max-w-16 truncate'>{file.name}</p>
        </div>
      </DialogTrigger>
      <DialogContent className='max-w-3xl max-h-[80vh] overflow-auto justify-center'>
        <div className='flex flex-col items-center justify-center text-lg font-bold py-4'>{file.name}</div>
        {file.type.startsWith('image') ? (
          <img src={URL.createObjectURL(file)} alt={file.name} className='max-w-full max-h-[80vh] rounded-md' />
        ) : (
          <pre className='whitespace-pre-wrap'>{content}</pre>
        )}
      </DialogContent>
    </Dialog>
  )
}

export const FilePreview: React.FC<FilePreviewProps> = ({ files }) => (
  <Card className='flex flex-col rounded-3xl rounded-b-none border-none w-1/2 '>
    <CardContent className='flex flex-row gap-2 px-6 p-1 w-full overflow-x-auto overflow-y-hidden justify-center'>
      {Array.from(files).map(file => (
        <FilePreviewItem key={file.name} file={file} />
      ))}
    </CardContent>
  </Card>
)
