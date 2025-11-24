import { Column } from '@tanstack/react-table'
import { cn } from '@/lib/utils'

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          '!text-sm font-medium tracking-wide capitalize',
          className
        )}
      >
        {title}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className='data-[state=open]:bg-accent flex h-8 items-center justify-center text-sm font-medium'>
        <span>{title}</span>
      </div>
    </div>
  )
}
