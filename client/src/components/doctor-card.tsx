import { Calendar, MessageCircle } from 'lucide-react'
import { serverImageUrl } from '@/api/server-url'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface DoctorCardProps {
  doctor: {
    id: string
    specialization: string
    experience: number
    consultationFee: number
    isAvailable: boolean
    user: {
      id: string
      firstName: string
      middleName?: string | null
      lastName: string
      profile?: string | null
    }
    _count?: {
      appointments: number
    }
  }
  showButtons?: boolean
  onBookAppointment?: (doctorId: string) => void
  onStartChat?: (userId: string) => void
}

const DoctorCard = ({
  doctor,
  showButtons = true,
  onBookAppointment,
  onStartChat,
}: DoctorCardProps) => {
  const getDoctorName = (doctor: any) => {
    const { firstName, middleName, lastName } = doctor.user
    return `Dr. ${firstName}${middleName ? ` ${middleName}` : ''} ${lastName}`
  }

  const getDoctorInitials = (doctor: any) => {
    const { firstName, lastName } = doctor.user
    return `${firstName[0]}${lastName[0]}`
  }

  const getProfileImageUrl = (profile: string | null | undefined) => {
    if (!profile) return null
    return `${serverImageUrl}${profile}`
  }

  const profileImageUrl = getProfileImageUrl(doctor.user.profile)

  return (
    <Card className='group relative overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20'>
      {/* Card gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>

      <CardContent className='relative p-6'>
        <div className='relative mb-4'>
          <div className='mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-100 via-purple-200 to-blue-100 shadow-2xl ring-4 ring-white/50 transition-all duration-300 group-hover:shadow-purple-500/25 group-hover:ring-purple-200/50'>
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={getDoctorName(doctor)}
                className='h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
            ) : (
              <div className='flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-200 to-purple-300'>
                <span className='text-lg font-bold text-purple-700'>
                  {getDoctorInitials(doctor)}
                </span>
              </div>
            )}
          </div>

          {doctor.isAvailable && (
            <Badge className='absolute -top-1 left-1/2 -translate-x-1/2 transform border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-xs font-medium text-white shadow-lg ring-2 ring-white'>
              <div className='mr-1.5 h-2 w-2 animate-pulse rounded-full bg-white'></div>
              Available Now
            </Badge>
          )}
        </div>

        <div className='text-center'>
          <h3 className='mb-2 text-xl font-bold text-gray-800 transition-colors duration-300 group-hover:text-purple-700'>
            {getDoctorName(doctor)}
          </h3>

          {/* Specialization and Fee in same row */}
          <div className='mb-3 flex items-center justify-between gap-2'>
            <div className='flex-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1'>
              <span className='text-sm font-semibold text-purple-700 capitalize'>
                {doctor.specialization}
              </span>
            </div>
            <div className='flex-1 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 px-2 py-1'>
              <div className='text-sm font-semibold text-purple-700'>
                Rs. {doctor.consultationFee}
              </div>
            </div>
          </div>

          <div className='mb-4 flex items-center justify-center gap-4 text-sm text-gray-600'>
            <div className='flex items-center gap-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-purple-400'></div>
              <span>{doctor.experience} years exp.</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='h-1.5 w-1.5 rounded-full bg-blue-400'></div>
              <span>{doctor._count?.appointments || 0} patients</span>
            </div>
          </div>

          {showButtons && (
            <div className='space-y-3'>
              <Button
                className='w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:shadow-purple-500/25'
                size='sm'
                onClick={() => {
                  if (onBookAppointment) {
                    onBookAppointment(doctor.id)
                  } else {
                    window.location.href = `/dashboard/appointments/add/${doctor.id}`
                  }
                }}
              >
                <Calendar className='mr-2 h-4 w-4' />
                Book Appointment
              </Button>

              <Button
                variant='outline'
                className='w-full border-2 border-blue-200 bg-white/50 text-blue-600 backdrop-blur-sm transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg'
                size='sm'
                onClick={() => {
                  if (onStartChat) {
                    onStartChat(doctor.user.id)
                  } else {
                    window.location.href = `/dashboard/chat/${doctor.user.id}`
                  }
                }}
              >
                <MessageCircle className='mr-2 h-4 w-4' />
                Start Chat
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default DoctorCard
