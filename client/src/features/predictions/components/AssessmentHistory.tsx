import { Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssessmentHistory } from '../utils/medical-utils'

interface AssessmentHistoryProps {
  history: AssessmentHistory[]
}

export const AssessmentHistoryComponent = ({
  history,
}: AssessmentHistoryProps) => {
  if (history.length === 0) return null

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
          <Clock className='text-muted-foreground h-5 w-5' />
          Recent Assessments
        </CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='max-h-64 space-y-0 overflow-auto'>
          {history.map((entry, index) => (
            <div
              key={index}
              className='hover:bg-accent border-b p-3 transition-colors last:border-b-0'
            >
              <div className='mb-1 flex items-start justify-between'>
                <div className='text-foreground text-sm font-semibold'>
                  {entry.result}
                </div>
                <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                  <Calendar className='h-3 w-3' />
                  {new Date(entry.date).toLocaleDateString()}
                </div>
              </div>
              <div className='text-muted-foreground text-xs'>
                <span className='font-medium'>Symptoms:</span>{' '}
                {entry.symptoms.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
