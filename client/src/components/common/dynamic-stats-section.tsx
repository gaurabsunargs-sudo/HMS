import { Users, Stethoscope, Award, Clock, Loader2 } from 'lucide-react'
import { usePublicStats } from '@/api/hooks/usePublicStats'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  isLoading?: boolean
  error?: boolean
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  isLoading,
  error,
}: StatCardProps) => {
  return (
    <Card className='text-center shadow-lg transition-all hover:shadow-xl'>
      <CardContent className='p-6'>
        <Icon className='mx-auto mb-4 h-12 w-12 text-purple-600' />
        <div className='mb-2 text-3xl font-bold text-gray-800'>
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
            </div>
          ) : (
            value
          )}
        </div>
        <div className='text-gray-600'>{label}</div>
        {error && isLoading && (
          <div className='mt-2 text-xs text-red-500'>Using default value</div>
        )}
      </CardContent>
    </Card>
  )
}

export const DynamicStatsSection = () => {
  const { data: stats, isLoading, error } = usePublicStats()

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K+`
    }
    return `${num}+`
  }

  const statsData = [
    {
      icon: Users,
      label: 'Patients Served',
      value: stats ? formatNumber(stats.totalPatients) : '50,000+',
      isLoading: isLoading,
    },
    {
      icon: Stethoscope,
      label: 'Expert Doctors',
      value: stats ? formatNumber(stats.totalDoctors) : '200+',
      isLoading: isLoading,
    },
    {
      icon: Award,
      label: 'Years of Service',
      value: stats ? `${stats.yearsOfService}+ years` : '2+ years',
      isLoading: false, // Static value
    },
    {
      icon: Clock,
      label: 'Emergency Response',
      value: stats ? stats.emergencyResponse : '24/7',
      isLoading: false, // Static value
    },
  ]

  return (
    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          isLoading={stat.isLoading}
          error={!!error}
        />
      ))}
    </div>
  )
}

export default DynamicStatsSection
