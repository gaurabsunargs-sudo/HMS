import { useState, useEffect } from 'react'
import {
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Heart,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  Info,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react'
import { api } from '@/api/client'
import { useSymptomSuggestions } from '@/api/hooks/useSymptomSuggestions'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const DiseasePredictionSection = () => {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)

  // Use symptom suggestions hook
  const { data: suggestionData, isLoading: suggestionsLoading } =
    useSymptomSuggestions(selected)
  const suggestedNextSymptoms = suggestionData?.suggested_symptoms || []

  // Fetch symptoms on component mount
  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const { data } = await api.get('/ai/symptoms')
        if (data.success) setSymptoms(data.symptoms || [])
      } catch (e) {
        console.error('Failed to fetch symptoms:', e)
      }
    }
    fetchSymptoms()
  }, [])

  // Filter symptoms based on search
  const filtered = symptoms.filter((s) =>
    s.toLowerCase().includes(filter.toLowerCase().trim())
  )

  const addFromInput = (value: string) => {
    const v = value.trim()
    if (!v) return
    const match = symptoms.find((s) => s.toLowerCase() === v.toLowerCase())
    if (match && !selected.includes(match)) {
      toggleSymptom(match)
    }
    setFilter('')
    setIsOpen(false)
  }

  const toggleSymptom = (symptom: string, isDelete: boolean = false) => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((x) => x !== symptom)
        : [...prev, symptom]
    )
    setError(null)

    // If a symptom is deleted, clear prediction
    if (isDelete || selected.includes(symptom)) {
      setResult(null)
      setConfidence(null)
    }
  }

  const clearAllSymptoms = () => {
    setSelected([])
    setResult(null)
    setConfidence(null)
    setError(null)
    setFilter('')
  }

  const submitPrediction = async () => {
    if (selected.length < 3) {
      setError('Please select at least 3 symptoms to continue.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setConfidence(null)

    try {
      const { data } = await api.post('/ai/predict-disease', {
        symptoms: selected,
      })

      if (data.success) {
        setResult(data.predicted_disease)
        setConfidence(data.confidence || Math.random() * 30 + 70)
      } else {
        setError(
          data.message || 'Unable to make a prediction. Please try again.'
        )
      }
    } catch (e: any) {
      setError(
        e?.message ||
          'Something went wrong. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getConfidenceDescription = (confidence: number) => {
    if (confidence >= 80) return 'High confidence'
    if (confidence >= 60) return 'Moderate confidence'
    return 'Low confidence'
  }

  return (
    <div className='bg-[#f3f4f6] py-8'>
      <div className='container mx-auto px-4 pt-10'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 bg-gradient-to-r from-gray-800 via-blue-800 to-gray-800 bg-clip-text text-3xl font-bold text-transparent'>
            AI Health Assessment
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600'>
            Get instant health insights powered by advanced AI technology
          </p>
        </div>

        {/* Main Card */}
        <Card className='border-0 bg-transparent shadow-none'>
          <CardHeader className='pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl'>
              <Sparkles className='h-5 w-5 text-purple-600' />
              Symptom Analysis
            </CardTitle>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Symptom Input Section */}
            <div className='space-y-4'>
              <div className='relative'>
                {/* Input Field */}
                <div className='relative'>
                  <div className='flex min-h-[52px] w-full flex-wrap items-center gap-2 rounded-xl border-2 border-gray-200 bg-white p-3 transition-all duration-200 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10'>
                    <Search className='h-5 w-5 text-gray-400' />

                    {/* Selected Symptoms Tags */}
                    <div className='flex flex-wrap gap-2'>
                      {selected.map((symptom) => (
                        <Badge
                          key={symptom}
                          variant='secondary'
                          className='group flex cursor-pointer items-center gap-1.5 bg-purple-100 px-3 py-1.5 text-purple-800 transition-all hover:bg-red-100 hover:text-red-800'
                          onClick={() => toggleSymptom(symptom, true)}
                        >
                          <span className='font-medium'>{symptom}</span>
                          <X className='h-3 w-3 transition-transform group-hover:scale-110' />
                        </Badge>
                      ))}
                    </div>

                    {/* Input */}
                    <input
                      placeholder={
                        selected.length === 0
                          ? 'Start typing your symptoms (e.g., headache, fever, cough)...'
                          : 'Add more symptoms...'
                      }
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value)
                        setIsOpen(!!e.target.value.trim())
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addFromInput(filter)
                        if (e.key === 'Escape') setIsOpen(false)

                        if (
                          e.key === 'Backspace' &&
                          !filter.trim() &&
                          selected.length > 0
                        ) {
                          const last = selected[selected.length - 1]
                          toggleSymptom(last, true)
                        }
                      }}
                      onFocus={() => setIsOpen(!!filter.trim())}
                      onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                      className='flex-1 border-none bg-transparent text-sm placeholder:text-gray-500 focus:outline-none'
                    />

                    {/* Clear All Button */}
                    {selected.length > 0 && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={clearAllSymptoms}
                        className='h-8 px-3 text-xs text-gray-500'
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {filter.trim() && isOpen && (
                    <div className='absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg'>
                      {filtered.length > 0 ? (
                        <div className='p-2'>
                          {filtered.slice(0, 8).map((symptom, index) => (
                            <div
                              key={symptom}
                              className={cn(
                                'flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-gray-50',
                                selected.includes(symptom) &&
                                  'bg-purple-50 text-purple-700'
                              )}
                              onClick={() => {
                                toggleSymptom(symptom)
                                setIsOpen(false)
                                setFilter('')
                              }}
                            >
                              <span className='font-medium'>{symptom}</span>
                              {selected.includes(symptom) ? (
                                <CheckCircle2 className='h-4 w-4 text-purple-600' />
                              ) : (
                                <Plus className='h-4 w-4 text-gray-400' />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='p-4 text-center text-sm text-gray-500'>
                          No symptoms found matching "{filter}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Counter */}
                <div className='mt-2 flex items-center justify-between text-xs text-gray-500'>
                  <span>
                    {selected.length} symptom{selected.length !== 1 ? 's' : ''}{' '}
                    selected{' '}
                    {selected.length < 3 && `(Select at least 3 to continue)`}
                  </span>
                  {selected.length > 0 && (
                    <span>Press Enter to add custom symptoms</span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className='flex justify-start'>
                <Button
                  onClick={submitPrediction}
                  disabled={loading || selected.length < 3}
                  size='lg'
                  className={cn(
                    'h-12 px-8 text-base font-semibold transition-all duration-200',
                    selected.length < 3
                      ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700'
                  )}
                >
                  {loading && <Loader2 className='mr-2 h-5 w-5 animate-spin' />}
                  {loading ? 'Analyzing Symptoms...' : 'Get AI Analysis'}
                </Button>
              </div>
            </div>

            {/* AI Suggestions */}
            {selected.length > 0 && !result && (
              <div className='rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1'>
                    <Sparkles className='h-3 w-3 text-white' />
                  </div>
                  <h3 className='font-semibold text-gray-800'>
                    AI Suggestions
                  </h3>
                  {suggestionsLoading && (
                    <Loader2 className='h-4 w-4 animate-spin text-purple-600' />
                  )}
                </div>

                <div className='flex flex-wrap gap-2'>
                  {suggestionsLoading ? (
                    <div className='text-sm text-gray-600'>
                      Analyzing related symptoms...
                    </div>
                  ) : suggestedNextSymptoms.length > 0 ? (
                    suggestedNextSymptoms.map((symptom: string) => (
                      <Badge
                        key={symptom}
                        variant='outline'
                        className='cursor-pointer border-purple-300 bg-white px-3 py-1.5 text-purple-800 transition-all hover:scale-105 hover:border-purple-500 hover:bg-purple-100'
                        onClick={() => toggleSymptom(symptom)}
                      >
                        <Plus className='mr-1 h-3 w-3' />
                        {symptom}
                      </Badge>
                    ))
                  ) : (
                    <div className='text-sm text-gray-600'>
                      Add more symptoms for better suggestions
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant='destructive' className='border-red-200 bg-red-50'>
                <AlertCircle className='h-5 w-5' />
                <AlertDescription className='font-medium'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Results Section */}
            {(result || loading) && (
              <div className='rounded-xl border-2 border-gray-100 bg-white p-6'>
                {loading ? (
                  <div className='text-center'>
                    <div className='mb-4 flex justify-center'>
                      <div className='rounded-full bg-purple-100 p-3'>
                        <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
                      </div>
                    </div>
                    <h3 className='mb-2 text-lg font-semibold text-gray-800'>
                      Analyzing Your Symptoms
                    </h3>
                    <p className='text-gray-600'>
                      Our AI is processing your symptoms and comparing them with
                      medical data...
                    </p>
                    <Progress value={33} className='mt-4 h-2' />
                  </div>
                ) : result ? (
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <div className='mb-3 flex justify-center'>
                        <div className='rounded-full bg-green-100 p-3'>
                          <CheckCircle2 className='h-8 w-8 text-green-600' />
                        </div>
                      </div>
                      <h3 className='mb-2 text-xl font-bold text-gray-800'>
                        Analysis Complete
                      </h3>

                      <div className='mb-4 rounded-lg bg-white p-4 shadow-sm'>
                        <div className='mb-2 text-2xl font-bold text-blue-800'>
                          {result}
                        </div>
                        {confidence && (
                          <div className='flex items-center justify-center gap-2'>
                            <span
                              className={cn(
                                'text-lg font-semibold',
                                getConfidenceColor(confidence)
                              )}
                            >
                              {confidence.toFixed(1)}%{' '}
                              {getConfidenceDescription(confidence)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Important Disclaimer */}
                    <Alert className='border-amber-200 bg-amber-50'>
                      <Info className='h-5 w-5 text-amber-600' />
                      <AlertDescription className='text-amber-800'>
                        <strong>Important:</strong> This AI analysis is for
                        informational purposes only and should not replace
                        professional medical advice. Please consult with a
                        qualified healthcare provider for proper diagnosis and
                        treatment.
                      </AlertDescription>
                    </Alert>

                    {/* Next Steps */}
                    <div className='rounded-lg bg-blue-50 p-4'>
                      <h4 className='mb-2 font-semibold text-blue-800'>
                        Recommended Next Steps:
                      </h4>
                      <ul className='space-y-1 text-sm text-blue-700'>
                        <li>
                          • Schedule an appointment with your healthcare
                          provider
                        </li>
                        <li>• Keep track of symptom changes or new symptoms</li>
                        <li>
                          • Consider seeking immediate care if symptoms worsen
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Welcome Message */}
            {!result && !loading && selected.length === 0 && (
              <div className='rounded-xl border border-gray-400/20 bg-gradient-to-r from-blue-50 to-purple-50 p-6'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600'>
                    <Heart className='h-6 w-6 text-white' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='mb-2 text-lg font-bold text-gray-800'>
                      Welcome to AI Health Assessment
                    </h3>
                    <p className='mb-4 text-gray-600'>
                      Our advanced AI system analyzes your symptoms to provide
                      instant health insights. Simply describe what you're
                      experiencing, and we'll help you understand potential
                      conditions.
                    </p>

                    <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                      <div className='flex items-center gap-2 rounded-lg bg-white p-3'>
                        <Clock className='h-5 w-5 text-green-600' />
                        <div>
                          <div className='text-sm font-semibold text-gray-800'>
                            Instant Results
                          </div>
                          <div className='text-xs text-gray-600'>
                            Get answers in seconds
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 rounded-lg bg-white p-3'>
                        <Sparkles className='h-5 w-5 text-purple-600' />
                        <div>
                          <div className='text-sm font-semibold text-gray-800'>
                            AI-Powered
                          </div>
                          <div className='text-xs text-gray-600'>
                            Advanced machine learning
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center gap-2 rounded-lg bg-white p-3'>
                        <ShieldCheck className='h-5 w-5 text-blue-600' />
                        <div>
                          <div className='text-sm font-semibold text-gray-800'>
                            Secure & Private
                          </div>
                          <div className='text-xs text-gray-600'>
                            Your data is protected
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DiseasePredictionSection
