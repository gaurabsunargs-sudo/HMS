import { forwardRef, useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  className?: string
  disabled?: boolean
  placeholder?: string
  id?: string
  disableFuture?: boolean
  disablePast?: boolean
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      className,
      disabled,
      placeholder,
      id,
      disableFuture = false,
      disablePast = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }

    const isFutureDate = (date: Date) => {
      if (!disableFuture) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date > today
    }

    const isPastDate = (date: Date) => {
      if (!disablePast) return false
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return date < today
    }

    const handleDateChange = (value: Value) => {
      if (value instanceof Date) {
        onChange?.(value)
        setIsOpen(false)
      }
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant={'outline'}
            className={cn(
              'hover:bg-card w-full min-w-[180px] justify-between px-3 text-left font-normal',
              !value && 'text-muted-foreground',
              className,
              disabled && 'cursor-not-allowed opacity-50'
            )}
            id={id}
          >
            {value ? (
              formatDate(value)
            ) : (
              <span>{placeholder || 'Pick a date'}</span>
            )}
            <CalendarIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start' ref={ref}>
          <Calendar
            onChange={handleDateChange}
            value={value || null}
            maxDate={disableFuture ? new Date() : undefined}
            minDate={disablePast ? new Date() : undefined}
            tileDisabled={({ date }) => isFutureDate(date) || isPastDate(date)}
            className='bg-background text-foreground rounded-md border p-1 shadow-sm'
          />
        </PopoverContent>
      </Popover>
    )
  }
)

DatePicker.displayName = 'DatePicker'

export default DatePicker
