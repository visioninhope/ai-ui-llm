import { cn } from '@/lib/utils'
import * as React from 'react'
import { Button } from './button'

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  vertical?: boolean
  roundedTop?: boolean
  roundedBottom?: boolean
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, vertical = false, roundedTop = true, roundedBottom = true, children, ...props }, ref) => {
    const [childrenArray, setChildrenArray] = React.useState<React.ReactNode[]>([])

    React.useEffect(() => {
      const flattenChildren = (children: React.ReactNode): React.ReactNode[] => {
        return React.Children.toArray(children).reduce((acc: React.ReactNode[], child) => {
          if (React.isValidElement(child) && child.type === React.Fragment) {
            return [...acc, ...flattenChildren(child.props.children)]
          }
          if (React.isValidElement(child) && child.type === Button) {
            return [...acc, child]
          }
          return acc
        }, [])
      }
      setChildrenArray(flattenChildren(children))
    }, [children])

    const modifiedChildren = childrenArray.map((child, index) => {
      if (React.isValidElement(child) && child.type === Button) {
        const isFirst = index === 0
        const isLast = index === childrenArray.length - 1
        return React.cloneElement(child, {
          ...child.props,
          className: cn(
            child.props.className,
            'rounded-none',
            {
              'rounded-tl-md': !vertical && isFirst && roundedTop,
              'rounded-tr-md': !vertical && isLast && roundedTop,
              'rounded-bl-md': !vertical && isFirst && roundedBottom,
              'rounded-br-md': !vertical && isLast && roundedBottom,
              'rounded-tl-md rounded-tr-md': vertical && isFirst && roundedTop,
              'rounded-bl-md rounded-br-md': vertical && isLast && roundedBottom,
              '-ml-px': !vertical && !isFirst,
              '-mt-px': vertical && !isFirst
            },
            'focus:z-10 focus:relative',
            'disabled:opacity-100',
            'group-button'
          )
        })
      }
      return child
    })

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          vertical ? 'flex-col' : 'flex-row',
          '[&>.group-button]:border-r-0 [&>.group-button:last-child]:border-r',
          className
        )}
        {...props}>
        {modifiedChildren}
      </div>
    )
  }
)

ButtonGroup.displayName = 'ButtonGroup'

export { ButtonGroup }
