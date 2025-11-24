// @ts-nocheck
import { Loader2, CheckCircle2, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import DoctorCard from '@/components/doctor-card'

interface Doctor {
  id: string
  user?: {
    firstName?: string
    lastName?: string
  }
  specialization?: string
  consultationFee?: number
  isAvailable?: boolean
}

interface AssessmentResultsProps {
  loading: boolean
  result: string | null
  confidence: number | null
  doctorSuggestions: Doctor[]
}

export const AssessmentResults = ({
  loading,
  result,
  confidence,
  doctorSuggestions,
}: AssessmentResultsProps) => {
  if (!loading && !result) return null

  return (
    <Card className='pt-6'>
      <CardContent>
        {loading ? (
          <div className='flex items-center justify-center py-8'>
            <div className='space-y-3 text-center'>
              <Loader2 className='text-muted-foreground mx-auto h-8 w-8 animate-spin' />
              <div className='space-y-1'>
                <p className='text-foreground text-sm font-medium'>
                  Processing symptoms...
                </p>
                <p className='text-muted-foreground text-xs'>
                  Please wait while we analyze your symptoms
                </p>
              </div>
            </div>
          </div>
        ) : (
          result && (
            <div className='space-y-4'>
              {/* Main Result */}
              <div className='bg-muted/50 rounded-md border p-4'>
                <div className='flex items-start gap-3'>
                  <div className='bg-primary/10 rounded-md p-2'>
                    <CheckCircle2 className='text-primary h-5 w-5' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-foreground mb-2 text-lg font-semibold'>
                      Preliminary Assessment: {result}
                    </h3>
                    {confidence && (
                      <div className='mb-3 flex items-center gap-2'>
                        <div className='text-muted-foreground text-xs font-medium'>
                          Confidence: {confidence.toFixed(1)}%
                        </div>
                        <div className='bg-secondary h-1.5 max-w-32 flex-1 rounded-full'>
                          <div
                            className='bg-primary h-1.5 rounded-full transition-all duration-500'
                            style={{ width: `${confidence}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Alert className='mt-3'>
                      <AlertCircle className='h-4 w-4' />
                      <AlertDescription className='text-xs'>
                        <strong>Note:</strong> This is a preliminary assessment
                        based on symptom analysis. Please consult with a
                        healthcare professional for proper diagnosis and
                        treatment.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>

              {/* Doctor Recommendations */}
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <User className='text-muted-foreground h-4 w-4' />
                  <h3 className='text-foreground text-sm font-semibold'>
                    Recommended Specialists ({doctorSuggestions.length})
                  </h3>
                </div>

                {doctorSuggestions.length > 0 ? (
                  <div className='mb-12 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6'>
                    {doctorSuggestions.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        showButtons={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className='bg-muted/50 rounded-md border px-3 py-4 text-center'>
                    <User className='text-muted-foreground/50 mx-auto mb-2 h-8 w-8' />
                    <h4 className='text-foreground mb-1 text-sm font-medium'>
                      No specialists available
                    </h4>
                    <p className='text-muted-foreground text-xs'>
                      Please consult with a general physician or visit your
                      nearest healthcare facility.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
