import { useState, useMemo } from 'react'
import {
  Search,
  X,
  Plus,
  Loader2,
  Heart,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useSymptomSuggestions } from '@/api/hooks/useSymptomSuggestions'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SymptomSelectionProps {
  symptoms: string[]
  selected: string[]
  onToggleSymptom: (symptom: string) => void
  onClearAll: () => void
  error: string | null
}

export const SymptomSelection = ({
  symptoms,
  selected,
  onToggleSymptom,
  onClearAll,
  error,
}: SymptomSelectionProps) => {
  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim()
    if (!q) return symptoms
    return symptoms.filter((s) => s.toLowerCase().includes(q))
  }, [filter, symptoms])

  const addFromInput = (value: string) => {
    const v = value.trim()
    if (!v) return
    const match = symptoms.find((s) => s.toLowerCase() === v.toLowerCase())
    if (match && !selected.includes(match)) {
      onToggleSymptom(match)
    }
    setFilter('')
    setIsOpen(false)
  }

  // Use the new API hook for symptom suggestions
  const { data: suggestionData, isLoading: suggestionsLoading } =
    useSymptomSuggestions(selected)
  const suggestedNextSymptoms = suggestionData?.suggested_symptoms || []

  return (
    <div className='space-y-6'>
      {/* Search Input */}
      <div className='relative'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Search symptoms (e.g., headache, fever, cough)...'
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value)
              setIsOpen(!!e.target.value.trim())
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addFromInput(filter)
              if (e.key === 'Escape') setIsOpen(false)
            }}
            onFocus={() => setIsOpen(!!filter.trim())}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            className='h-10 pr-10 pl-10 text-sm'
          />
          {filter && (
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2'
              onClick={() => {
                setFilter('')
                setIsOpen(false)
              }}
              aria-label='Clear search'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {filter.trim() && isOpen && (
          <div className='bg-popover absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border shadow-lg'>
            {filtered.length > 0 ? (
              <>
                {filtered.slice(0, 8).map((s, index) => (
                  <div
                    key={s}
                    className={cn(
                      'hover:bg-accent flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors',
                      selected.includes(s) &&
                        'bg-accent text-accent-foreground',
                      index === 0 && 'rounded-t-md',
                      index === Math.min(filtered.length - 1, 7) &&
                        'rounded-b-md'
                    )}
                    onClick={() => {
                      onToggleSymptom(s)
                      setIsOpen(false)
                      setFilter('')
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className='font-medium'>{s}</span>
                    {selected.includes(s) ? (
                      <CheckCircle2 className='text-primary h-4 w-4' />
                    ) : (
                      <Plus className='text-muted-foreground h-4 w-4' />
                    )}
                  </div>
                ))}
                {filtered.length > 8 && (
                  <div className='bg-muted text-muted-foreground rounded-b-md px-3 py-2 text-xs'>
                    +{filtered.length - 8} more results...
                  </div>
                )}
              </>
            ) : (
              <div className='text-muted-foreground px-4 py-6 text-center'>
                <AlertCircle className='text-muted-foreground/50 mx-auto mb-2 h-6 w-6' />
                <p className='text-sm font-medium'>No symptoms found</p>
                <p className='text-xs'>Try different search terms</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Symptoms */}
      {selected.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-foreground text-sm font-semibold'>
              Selected Symptoms ({selected.length})
            </h3>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClearAll}
              className='text-destructive text-xs'
            >
              <X className='mr-1 h-3 w-3' />
              Clear all
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            {selected.map((s) => (
              <Badge
                key={s}
                variant='secondary'
                className='hover:bg-destructive hover:text-destructive-foreground cursor-pointer px-2 py-1 text-xs font-medium transition-colors'
                onClick={() => onToggleSymptom(s)}
              >
                {s}
                <X className='ml-1 h-3 w-3' />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Symptoms */}
      {selected.length > 0 && (
        <div className='bg-muted/50 space-y-3 rounded-md border p-3'>
          <div className='flex items-center gap-2'>
            <Heart className='text-muted-foreground h-4 w-4' />
            <span className='text-foreground text-xs font-semibold'>
              Related Symptoms:
            </span>
            {suggestionsLoading && (
              <Loader2 className='text-muted-foreground h-3 w-3 animate-spin' />
            )}
          </div>
          {suggestionsLoading ? (
            <div className='flex items-center justify-center py-3'>
              <div className='text-muted-foreground text-xs'>
                Loading related symptoms...
              </div>
            </div>
          ) : suggestedNextSymptoms.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {suggestedNextSymptoms.map((s: string) => (
                <Badge
                  key={s}
                  variant='outline'
                  className='hover:bg-accent hover:text-accent-foreground cursor-pointer px-2 py-1 text-xs transition-colors'
                  onClick={() => onToggleSymptom(s)}
                >
                  <Plus className='mr-1 h-3 w-3' />
                  {s}
                </Badge>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground text-xs'>
              No additional symptoms found based on your selection.
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription className='text-sm font-medium'>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
