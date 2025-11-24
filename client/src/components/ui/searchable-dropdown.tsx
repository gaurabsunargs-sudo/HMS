import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, Check, X, Search, Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from './input'

interface Option {
  value: string
  label: string
}

interface SearchableDropdownProps {
  options?: Option[]
  placeholder?: string
  onSelect?: (value: string | number) => void
  onChange?: (value: string | number) => void
  onBlur?: () => void
  name?: string
  className?: string
  disabled?: boolean
  value?: string
  isLoading?: boolean
  showCross?: boolean
  loadingText?: string
  returnType?: 'string' | 'number'
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options = [],
  placeholder = 'Select an option',
  onSelect,
  onChange,
  onBlur,
  name,
  className = '',
  disabled = false,
  value: propValue = '',
  isLoading = false,
  showCross = false,
  loadingText = 'Loading...',
  returnType = 'string',
}) => {
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState<string>(propValue)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInternalValue(propValue)
  }, [propValue])

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedOption = options.find(
    (option) => option.value === internalValue
  )

  useEffect(() => {
    setFocusedIndex(-1)
  }, [filteredOptions.length])

  useEffect(() => {
    if (open) {
      setSearchQuery('')
    } else {
      setSearchQuery('')
      setFocusedIndex(-1)
    }
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [open])

  const handleSelect = (optionValue: string) => {
    if (isLoading) return
    setInternalValue(optionValue)
    setSearchQuery('')
    setOpen(false)
    setFocusedIndex(-1)

    onSelect?.(returnType === 'number' ? Number(optionValue) : optionValue)
    onChange?.(returnType === 'number' ? Number(optionValue) : optionValue)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (isLoading) return
    setInternalValue('')
    setSearchQuery('')
    setFocusedIndex(-1)

    onSelect?.(returnType === 'number' ? 0 : '')
    onChange?.(returnType === 'number' ? 0 : '')
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return
    const newValue = e.target.value
    setSearchQuery(newValue)
    if (!open) setOpen(true)
    setFocusedIndex(-1)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isLoading) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!open) {
          setOpen(true)
        } else {
          setFocusedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          )
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          )
        }
        break
      case 'Enter':
        e.preventDefault()
        if (open && focusedIndex >= 0 && filteredOptions[focusedIndex]) {
          handleSelect(filteredOptions[focusedIndex].value)
        }
        break
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
    }
  }

  const handleInputBlur = () => {
    onBlur?.()
  }

  const handleOptionMouseEnter = (index: number) => {
    setFocusedIndex(index)
  }

  const getInputDisplayValue = () => {
    if (open) {
      return searchQuery
    }

    return selectedOption?.label ?? ''
  }

  return (
    <div className={`relative w-full`} ref={containerRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={`border-input bg-popover text-popover-foreground relative flex w-full items-center rounded-md border ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'
            } ${isLoading ? 'cursor-wait' : ''}`}
            onClick={() => {
              if (!disabled && !isLoading) {
                if (!open) {
                  setOpen(true)
                }
              }
            }}
          >
            <Input
              ref={inputRef}
              type='text'
              name={name}
              value={getInputDisplayValue()}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={`line-clamp-1 ${className} h-[35px] w-full border-none bg-transparent px-3 pr-10 outline-none ${
                disabled || isLoading ? 'cursor-not-allowed' : ''
              }`}
            />
            <div className='absolute right-2 flex items-center gap-1'>
              {showCross && (
                <>
                  {internalValue && !disabled && !isLoading && !open && (
                    <button
                      type='button'
                      onClick={handleClear}
                      className='hover:bg-destructive/10 text-destructive scale-[0.8] rounded-full p-1 transition-colors'
                      aria-label='Clear selection'
                    >
                      <X className='h-4 w-4' />
                    </button>
                  )}
                </>
              )}
              <span className='text-muted-foreground'>
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : open ? (
                  <ChevronUp className='h-4 w-4' />
                ) : (
                  <ChevronDown className='h-4 w-4' />
                )}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent
          className='min-w-(--radix-popover-trigger-width) overflow-hidden p-0'
          align='start'
          sideOffset={4}
        >
          {isLoading ? (
            <div className='p-4 text-center'>
              <Loader2 className='text-muted-foreground mx-auto mb-2 h-5 w-5 animate-spin' />
              <p className='text-sm'>{loadingText}</p>
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className='p-4 text-center'>
              <Search className='text-muted-foreground mx-auto mb-2 h-5 w-5' />
              <p className='text-sm'>No options found</p>
              <p className='text-muted-foreground mt-1 text-xs'>
                Try adjusting your search
              </p>
            </div>
          ) : (
            <ScrollArea className='h-full'>
              <div className='max-h-[200px]'>
                {filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => handleOptionMouseEnter(index)}
                    className={`hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between px-3 py-2 pr-6! text-left text-sm ${
                      index < filteredOptions.length - 1
                        ? 'border-border border-b'
                        : ''
                    } ${
                      internalValue === option.value
                        ? 'bg-accent text-accent-foreground'
                        : ''
                    } ${focusedIndex === index ? 'bg-accent/50' : ''} `}
                  >
                    <span className='truncate'>{option.label}</span>
                    {internalValue === option.value && (
                      <Check className='text-primary h-4 w-4' />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default SearchableDropdown
