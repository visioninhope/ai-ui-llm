import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { CodeBlock } from './code-block'

export const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <CodeBlock
          key={crypto.randomUUID()}
          language={(match && match[1]) || ''}
          value={String(children).replace(/\n$/, '')}
          {...props}
        />
      ) : (
        <code
          {...props}
          className={`bg-background text-foreground/70 rounded-md px-1 py-0.5 ${className} overflow-auto`}>
          {children}
        </code>
      )
    },
    p: ({ children }: any) => <p className='mb-2 leading-7'>{children}</p>,
    h1: ({ children }: any) => <h1 className='text-2xl font-bold mt-6 mb-2'>{children}</h1>,
    h2: ({ children }: any) => <h2 className='text-xl font-semibold mt-4 mb-2'>{children}</h2>,
    h3: ({ children }: any) => <h3 className='text-lg font-medium mt-3 mb-1'>{children}</h3>,
    ul: ({ children }: any) => <ul className='list-disc list-inside ml-4 mb-2'>{children}</ul>,
    ol: ({ children }: any) => <ol className='list-decimal list-inside ml-4 mb-2'>{children}</ol>,
    li: ({ children }: any) => <li className='mb-1'>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote className='border-l-4 border-foreground/50 pl-4 py-1 mb-2 italic'>{children}</blockquote>
    ),
    a: ({ children, href }: any) => (
      <a
        href={href}
        className='text-blue-500 hover:underline'>
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className='max-w-full h-auto my-2 rounded-lg'
      />
    ),
    table: ({ children }: any) => (
      <div className='overflow-x-auto mb-2'>
        <table className='min-w-full border border-foreground/50'>{children}</table>
      </div>
    ),
    th: ({ children }: any) => <th className='border border-foreground/50 px-4 py-2 bg-background/80'>{children}</th>,
    td: ({ children }: any) => <td className='border border-foreground/50 px-4 py-2'>{children}</td>
  }

  return (
    <div className='markdown-content text-foreground text-xs'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}

export const Markdown = React.memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
)
