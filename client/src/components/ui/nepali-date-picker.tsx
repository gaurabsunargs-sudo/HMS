'use client'

import * as React from 'react'
import { BSToAD, ADToBS } from 'bikram-sambat-js'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { englishToNepaliNumber } from 'nepali-number'
import {
  bsMonthCalculatedData,
  bsMonthMaxDays,
  months,
  NEPALI,
  weeks,
} from '@/lib/nepali-date-resource'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

function getNumberOfDaysInBSMonth(yearMonth: { year: number; month: number }) {
  const { year, month } = yearMonth
  let yearCount = 0
  const totalYears = year + 1 - 2000
  const bsMonthData = bsMonthCalculatedData[month - 1]

  return bsMonthData.reduce((numberOfDays, monthData, index) => {
    if (monthData === 0 || numberOfDays !== 0) return numberOfDays

    const bsMonthUpperDaysIndex = index % 2
    yearCount += monthData

    if (totalYears > yearCount) return numberOfDays

    // Special cases
    if (year === 2081 && month === 2)
      return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex + 1]
    if (year === 2081 && month === 3)
      return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex - 1]
    if (year === 2081 && month === 11)
      return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex] - 1
    if (year === 2081 && month === 12)
      return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex] + 1
    if ((year === 2085 && month === 5) || (year === 2088 && month === 5))
      return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex] - 2

    return bsMonthMaxDays[month - 1][bsMonthUpperDaysIndex]
  }, 0)
}

function parseBSDate(date: string, separator = '-') {
  const [year, month, day] = date.split(separator).map(Number)
  const adDate = new Date(BSToAD(date))
  const firstAdDateInBSMonth = new Date(BSToAD(`${year}-${month}-01`))

  return {
    adDate,
    bsDay: day,
    bsMonth: month,
    bsYear: year,
    firstAdDayInBSMonth: firstAdDateInBSMonth,
    weekDay: adDate.getDay(),
  }
}

function stitchDate(
  date: { year: number; month: number; day: number },
  separator = '-'
) {
  return `${date.year}${separator}${date.month.toString().padStart(2, '0')}${separator}${date.day.toString().padStart(2, '0')}`
}

function formatNepaliDate(date: string, locale: 'en' | 'ne') {
  const { bsYear, bsMonth, bsDay } = parseBSDate(date)
  const monthName = months[locale][bsMonth - 1]
  const day = locale === NEPALI ? englishToNepaliNumber(bsDay) : bsDay
  const year = locale === NEPALI ? englishToNepaliNumber(bsYear) : bsYear

  return `${day} ${monthName}, ${year}`
}

type ViewMode = 'days' | 'months' | 'years'
export function NepaliDatePicker({
  className,
  value,
  onChange,
  locale = NEPALI,
  disableFuture = false,
  placeholder = 'Pick a date',
  showTodayButton = false,
  disabled = false,
  ...otherProps
}: {
  className?: string
  value?: string
  onChange?: (date: string) => void
  locale?: 'en' | 'ne'
  disableFuture?: boolean
  showTodayButton?: boolean
  disabled?: boolean
  placeholder?: string
  [key: string]: any
}) {
  const [date, setDate] = React.useState<string | undefined>(value)
  const [open, setOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ViewMode>('days')
  const today = React.useMemo(() => parseBSDate(ADToBS(new Date())), [])
  const parsedDate = date ? parseBSDate(date) : null

  // Add a new state to track displayed month/year without changing the selected date
  const [displayedMonthYear, setDisplayedMonthYear] = React.useState<{
    year: number
    month: number
  } | null>(null)

  // Initialize year range based on current date
  const [yearRange, setYearRange] = React.useState(() => {
    const currentYear = today.bsYear
    return {
      start: Math.floor(currentYear / 20) * 20,
      end: Math.floor(currentYear / 20) * 20 + 19,
    }
  })

  React.useEffect(() => {
    if (value !== undefined) {
      setDate(value)
      if (value) {
        const parsed = parseBSDate(value)
        setDisplayedMonthYear({ year: parsed.bsYear, month: parsed.bsMonth })
      }
    }
  }, [value])

  React.useEffect(() => {
    if (open) {
      const currentYear = parsedDate ? parsedDate.bsYear : today.bsYear
      setYearRange({
        start: Math.floor(currentYear / 20) * 20,
        end: Math.floor(currentYear / 20) * 20 + 19,
      })

      // Initialize displayed month/year when opening the calendar
      if (parsedDate) {
        setDisplayedMonthYear({
          year: parsedDate.bsYear,
          month: parsedDate.bsMonth,
        })
      } else {
        setDisplayedMonthYear({ year: today.bsYear, month: today.bsMonth })
      }
    }
  }, [open, parsedDate?.bsYear])

  const handleDateSelect = (bsDate: {
    year: number
    month: number
    day: number
  }) => {
    const newDate = stitchDate(bsDate)
    setDate(newDate)
    setDisplayedMonthYear({ year: bsDate.year, month: bsDate.month })
    onChange?.(newDate)
    setOpen(false)
    setViewMode('days')
  }

  const handleMonthSelect = (month: number) => {
    // Update the displayed month without changing the selected date
    setDisplayedMonthYear((prev) =>
      prev ? { ...prev, month } : { year: today.bsYear, month }
    )
    setViewMode('days')
  }

  const handleYearSelect = (year: number) => {
    // Update the displayed year without changing the selected date
    setDisplayedMonthYear((prev) =>
      prev ? { ...prev, year } : { year, month: today.bsMonth }
    )
    setViewMode('months')
  }

  const handlePreviousMonth = () => {
    if (!displayedMonthYear) return

    let newMonth = displayedMonthYear.month - 1
    let newYear = displayedMonthYear.year

    if (newMonth < 1) {
      newMonth = 12
      newYear--
    }

    setDisplayedMonthYear({ year: newYear, month: newMonth })
  }

  const handleNextMonth = () => {
    if (!displayedMonthYear) return

    let newMonth = displayedMonthYear.month + 1
    let newYear = displayedMonthYear.year

    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }

    if (disableFuture) {
      if (
        newYear > today.bsYear ||
        (newYear === today.bsYear && newMonth > today.bsMonth)
      ) {
        return
      }
    }

    setDisplayedMonthYear({ year: newYear, month: newMonth })
  }

  const handlePreviousYear = () => {
    if (viewMode === 'days' || viewMode === 'months') {
      if (displayedMonthYear) {
        setDisplayedMonthYear({
          ...displayedMonthYear,
          year: displayedMonthYear.year - 1,
        })
      }
    } else {
      setYearRange((prev) => ({
        start: prev.start - 20,
        end: prev.end - 20,
      }))
    }
  }

  const handleNextYear = () => {
    if (viewMode === 'days' || viewMode === 'months') {
      if (displayedMonthYear) {
        const newYear = displayedMonthYear.year + 1
        if (disableFuture && newYear > today.bsYear) return
        setDisplayedMonthYear({ ...displayedMonthYear, year: newYear })
      }
    } else {
      setYearRange((prev) => ({
        start: prev.start + 20,
        end: prev.end + 20,
      }))
    }
  }

  const isDisabled = (year: number, month?: number, day?: number) => {
    if (disableFuture) {
      const compareDate = day
        ? { year, month: month!, day }
        : month
          ? { year, month, day: 1 }
          : { year, month: 1, day: 1 }

      const current = today
      return (
        compareDate.year > current.bsYear ||
        (compareDate.year === current.bsYear &&
          compareDate.month > current.bsMonth) ||
        (compareDate.year === current.bsYear &&
          compareDate.month === current.bsMonth &&
          compareDate.day > current.bsDay)
      )
    }
    return false
  }

  const renderDaysView = () => {
    if (!displayedMonthYear) return null

    // Create a full date object for the first day of the displayed month
    const displayDateStr = stitchDate({
      year: displayedMonthYear.year,
      month: displayedMonthYear.month,
      day: 1,
    })
    const displayDate = parseBSDate(displayDateStr)

    const daysInMonth = getNumberOfDaysInBSMonth({
      year: displayedMonthYear.year,
      month: displayedMonthYear.month,
    })

    const firstDayOfMonth = displayDate.firstAdDayInBSMonth.getDay()
    const totalDaysToShow = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7

    const days = Array.from({ length: totalDaysToShow }, (_, i) => {
      const day = i - firstDayOfMonth + 1
      const isCurrentMonth = day > 0 && day <= daysInMonth
      const isSaturday = i % 7 === 6

      return {
        day: isCurrentMonth
          ? day
          : day <= 0
            ? getNumberOfDaysInBSMonth({
                year:
                  displayedMonthYear.month === 1
                    ? displayedMonthYear.year - 1
                    : displayedMonthYear.year,
                month:
                  displayedMonthYear.month === 1
                    ? 12
                    : displayedMonthYear.month - 1,
              }) + day
            : day - daysInMonth,
        isCurrentMonth,
        isToday:
          isCurrentMonth &&
          day === today.bsDay &&
          displayedMonthYear.month === today.bsMonth &&
          displayedMonthYear.year === today.bsYear,
        isSelected:
          isCurrentMonth &&
          parsedDate &&
          day === parsedDate.bsDay &&
          displayedMonthYear.month === parsedDate.bsMonth &&
          displayedMonthYear.year === parsedDate.bsYear,
        isDisabled:
          isCurrentMonth &&
          isDisabled(displayedMonthYear.year, displayedMonthYear.month, day),
        isSaturday,
      }
    })

    return (
      <>
        <div className='mb-2 grid grid-cols-7 gap-2'>
          {weeks[locale].map((day, index) => (
            <div
              key={day}
              className={cn(
                'flex h-8 items-center justify-center text-center text-sm font-medium',
                index === 6 && 'text-red-500'
              )}
            >
              {day}
            </div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-2'>
          {days.map((dayData, index) => (
            <Button
              key={index}
              variant='ghost'
              size='sm'
              disabled={dayData.isDisabled}
              className={cn(
                'h-8 w-8 p-0 font-normal',
                !dayData.isCurrentMonth && 'text-muted-foreground opacity-50',
                dayData.isToday && 'bg-accent text-accent-foreground',
                dayData.isSelected && 'bg-primary text-primary-foreground',
                dayData.isDisabled && 'cursor-not-allowed opacity-50',
                dayData.isSaturday &&
                  !dayData.isToday &&
                  !dayData.isSelected &&
                  'text-red-500'
              )}
              onClick={() => {
                if (dayData.isCurrentMonth && !dayData.isDisabled) {
                  handleDateSelect({
                    year: displayedMonthYear.year,
                    month: displayedMonthYear.month,
                    day: dayData.day,
                  })
                }
              }}
            >
              {locale === NEPALI
                ? englishToNepaliNumber(dayData.day)
                : dayData.day}
            </Button>
          ))}
        </div>
      </>
    )
  }

  const renderMonthsView = () => {
    if (!displayedMonthYear) return null

    return (
      <div className='grid grid-cols-3 gap-2'>
        {months[locale].map((month, index) => {
          const monthNumber = index + 1
          const disabled = isDisabled(displayedMonthYear.year, monthNumber)

          return (
            <Button
              key={month}
              variant='ghost'
              disabled={disabled}
              className={cn(
                'h-10',
                disabled && 'cursor-not-allowed opacity-50',
                parsedDate &&
                  parsedDate.bsMonth === monthNumber &&
                  parsedDate.bsYear === displayedMonthYear.year &&
                  'bg-primary text-primary-foreground'
              )}
              onClick={() => !disabled && handleMonthSelect(monthNumber)}
            >
              {month}
            </Button>
          )
        })}
      </div>
    )
  }

  const renderYearsView = () => {
    const years = Array.from({ length: 20 }, (_, i) => yearRange.start + i)

    return (
      <div className='grid grid-cols-4 gap-2'>
        {years.map((year) => {
          const disabled = isDisabled(year)
          const isSelected = parsedDate && parsedDate.bsYear === year
          const isCurrentYear = year === today.bsYear

          return (
            <Button
              key={year}
              variant='ghost'
              disabled={disabled}
              className={cn(
                'h-10',
                disabled && 'cursor-not-allowed opacity-50',
                isSelected && 'bg-primary text-primary-foreground',
                !isSelected && isCurrentYear && 'border-primary border'
              )}
              onClick={() => !disabled && handleYearSelect(year)}
            >
              {locale === NEPALI ? englishToNepaliNumber(year) : year}
            </Button>
          )
        })}
      </div>
    )
  }

  // Use the displayedMonthYear for header display but fallback to selected date or today
  const displayMonthYear =
    displayedMonthYear ||
    (parsedDate
      ? { year: parsedDate.bsYear, month: parsedDate.bsMonth }
      : { year: today.bsYear, month: today.bsMonth })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'hover:bg-card w-full min-w-[180px] justify-between px-3 text-left font-normal',
            !value && 'text-muted-foreground',
            className,
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}
          {...otherProps}
        >
          {date ? formatNepaliDate(date, locale) : <span>{placeholder}</span>}
          <CalendarIcon className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-0'>
        <div className='p-3'>
          <div className='mb-1 flex items-center justify-between border-b pb-1'>
            <div className='flex gap-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handlePreviousYear}
                className='h-8 w-8 p-0'
                disabled={false}
              >
                <ChevronsLeft className='h-4 w-4' />
              </Button>
              {viewMode === 'days' && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handlePreviousMonth}
                  className='h-8 w-8 p-0'
                  disabled={false}
                >
                  <ChevronLeft className='h-4 w-4' />
                </Button>
              )}
            </div>

            <Button
              variant='ghost'
              className='px-4 font-medium'
              onClick={() =>
                setViewMode(viewMode === 'days' ? 'months' : 'years')
              }
            >
              {viewMode === 'days' && (
                <>
                  {months[locale][displayMonthYear.month - 1]}{' '}
                  {locale === NEPALI
                    ? englishToNepaliNumber(displayMonthYear.year)
                    : displayMonthYear.year}
                </>
              )}
              {viewMode === 'months' &&
                (locale === NEPALI
                  ? englishToNepaliNumber(displayMonthYear.year)
                  : displayMonthYear.year)}
              {viewMode === 'years' && `${yearRange.start} - ${yearRange.end}`}
            </Button>

            <div className='flex gap-1'>
              {viewMode === 'days' && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleNextMonth}
                  className='h-8 w-8 p-0'
                  disabled={
                    disableFuture &&
                    displayMonthYear.year >= today.bsYear &&
                    displayMonthYear.month >= today.bsMonth
                  }
                >
                  <ChevronRight className='h-4 w-4' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={handleNextYear}
                className='h-8 w-8 p-0'
                disabled={
                  disableFuture && displayMonthYear.year >= today.bsYear
                }
              >
                <ChevronsRight className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {viewMode === 'days' && renderDaysView()}
          {viewMode === 'months' && renderMonthsView()}
          {viewMode === 'years' && renderYearsView()}

          {showTodayButton && (
            <div className='mt-4 flex justify-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  const todayDate = ADToBS(new Date())
                  setDate(todayDate)
                  onChange?.(todayDate)
                  setOpen(false)
                }}
                disabled={
                  disableFuture &&
                  isDisabled(today.bsYear, today.bsMonth, today.bsDay)
                }
              >
                Today
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
