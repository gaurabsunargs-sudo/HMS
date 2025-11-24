import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  isLoading = false,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  description?: string
  isLoading?: boolean
}) => (
  <Card className='relative overflow-hidden'>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-muted-foreground text-sm font-medium'>
        {title}
      </CardTitle>
      <Icon className='text-muted-foreground h-4 w-4' />
    </CardHeader>
    <CardContent>
      <div className='space-y-1'>
        {isLoading ? (
          <Skeleton className='h-8 w-20' />
        ) : (
          <div className='text-2xl font-bold'>{value}</div>
        )}
        {description && (
          <p className='text-muted-foreground text-xs leading-relaxed'>
            {description}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
)

export default StatCard
