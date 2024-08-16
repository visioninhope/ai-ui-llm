import React from 'react'
import './loader.css'

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface LoaderProps {
  size?: LoaderSize
  className?: string
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={className}>
      <div className={`orbit-spinner orbit-spinner-${size}`}>
        <div className='orbit'></div>
        <div className='orbit'></div>
        <div className='orbit'></div>
      </div>
    </div>
  )
}

export default Loader
