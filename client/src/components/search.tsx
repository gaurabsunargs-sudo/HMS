// @ts-nocheck
import { IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-context'
import { Button } from './ui/button'

interface Props {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '', placeholder = 'Search' }: Props) {
  const { setOpen } = useSearch()
  return (
    <Button
      variant='outline'
      className={cn(
        'bg-card text-muted-foreground relative h-8 w-full flex-1 items-center justify-start rounded-md text-sm font-normal shadow-none sm:pr-12 md:w-40 md:flex-none lg:w-56 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <IconSearch
        aria-hidden='true'
        className='absolute top-1/2 left-1.5 h-4 w-4 -translate-y-1/2'
      />
      <span className='ml-3'>{placeholder}</span>
      <kbd className='borderpx-1.5 pointer-events-none absolute right-2 hidden h-5 items-center gap-0.5 rounded border px-1 pt-[1px] font-mono text-[12px] font-medium opacity-100 select-none sm:flex'>
        <span className='text-[8px]'>⌘</span>K
      </kbd>
    </Button>
  )
}
