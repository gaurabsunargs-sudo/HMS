import React, { useCallback, useRef, useState } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'

type Option = Record<'value' | 'label', string>

interface MultiSelectProps {
  options?: Option[]
  value?: string[]
  onChange?: (value: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelectInput({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options...',
  className,
  ...props
}: MultiSelectProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleUnselect = useCallback(
    (id: string) => {
      if (onChange) {
        onChange(value.filter((s) => s !== id))
      }
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (inputRef.current) {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          if (inputValue === '') {
            onChange?.(value.slice(0, -1))
          }
        }
        if (e.key === 'Escape') {
          inputRef.current.blur()
        }
      }
    },
    [value, inputValue, onChange]
  )

  const selectables = options.filter((item) => !value.includes(item.value))

  return (
    <Command
      onKeyDown={handleKeyDown}
      className={`overflow-visible bg-transparent ${className}`}
      {...props}
    >
      <div className='group border-input ring-offset-background focus-within:ring-ring rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2'>
        <div className='flex flex-wrap gap-1'>
          {value.map((id) => {
            const option = options.find((item) => item.value === id)
            return (
              <Badge
                key={id}
                variant='default'
                className='flex justify-between'
              >
                <div className='w-full'>{option?.label || id}</div>
                <button
                  className='ring-offset-background focus:ring-ring -mr-1 ml-2 rounded-full bg-red-600/90 p-[1px] shadow-none outline-none focus:ring-2 focus:ring-offset-2'
                  onClick={() => handleUnselect(id)}
                >
                  <X className='h-3 w-3 text-white/80 hover:text-white' />
                </button>
              </Badge>
            )
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className='placeholder:text-muted-foreground flex-1 bg-transparent outline-none'
          />
        </div>
      </div>
      <div className='relative mt-2'>
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className='bg-popover text-popover-foreground animate-in absolute top-0 z-[9999999] max-h-[200px] w-full overflow-auto rounded-md border shadow-md outline-none'>
              <CommandGroup>
                <ScrollArea>
                  {selectables.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setInputValue('')
                        onChange?.([...value, option.value])
                      }}
                      onSelect={() => {
                        setInputValue('')
                        onChange?.([...value, option.value])
                      }}
                      className='cursor-pointer'
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  )
}
