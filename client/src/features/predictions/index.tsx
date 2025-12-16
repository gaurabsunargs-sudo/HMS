import { Search, Loader2, Stethoscope, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBreadcrumb } from '@/hooks/useBreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/pageHeader'
import { AssessmentHistoryComponent } from './components/AssessmentHistory'
import { AssessmentResults } from './components/AssessmentResults'
import { SymptomSelection } from './components/SymptomSelection'
import { useAssessment } from './hooks/useAssessment'

const Predictions = () => {
  useBreadcrumb([{ link: '/predictions', title: 'Symptom Assessment' }])

  const {
    symptoms,
    selected,
    loading,
    result,
    error,
    doctorSuggestions,
    history,
    confidence,
    submitAssessment,
    toggleSymptom,
    clearAll,
  } = useAssessment()

  return (
    <>
      <div className='space-y-6'>
        {/* Header */}
        <PageHeader
          title='Symptom Assessment'
          description='Select your symptoms for medical evaluation and specialist recommendations. This tool assists healthcare providers in preliminary assessment.'
        />

        {/* Main Assessment Card */}
        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
              <Sparkles className='text-purple-600' />
              Symptom Selection
            </CardTitle>
            <p className='text-muted-foreground mt-1 text-sm'>
              Search and select symptoms for medical evaluation
            </p>
          </CardHeader>
          <CardContent className='space-y-6 pt-5'>
            <SymptomSelection
              symptoms={symptoms}
              selected={selected}
              onToggleSymptom={toggleSymptom}
              onClearAll={clearAll}
              error={error}
            />

            {/* Assessment Button */}
            <div className='flex items-center justify-between border-t pt-4'>
              <div className='flex items-center gap-4'>
                <Button
                  onClick={submitAssessment}
                  disabled={loading || selected.length < 3}
                  size='default'
                  className={cn(
                    'h-9 px-6 text-sm font-medium transition-all',
                    selected.length < 3 ? 'cursor-not-allowed opacity-50' : ''
                  )}
                >
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {loading ? 'Processing...' : 'Generate Assessment'}
                </Button>

                {!loading && (
                  <div className='text-muted-foreground text-xs'>
                    {selected.length} symptom{selected.length !== 1 ? 's' : ''}{' '}
                    selected{' '}
                    {selected.length < 3 && `(Select at least 3 to continue)`}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Results */}
        {(result || loading) && (
          <Card>
            <CardHeader className='border-b'>
              <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                <Stethoscope className='text-muted-foreground h-5 w-5' />
                Assessment Results
              </CardTitle>
            </CardHeader>
            <div className='p-6'>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loader2 className='text-muted-foreground mx-auto h-8 w-8 animate-spin' />
                </div>
              ) : (
                <AssessmentResults
                  loading={loading}
                  result={result}
                  confidence={confidence}
                  doctorSuggestions={doctorSuggestions}
                />
              )}
            </div>
          </Card>
        )}

        {/* History Section */}
        <AssessmentHistoryComponent history={history} />
      </div>
    </>
  )
}

export default Predictions
