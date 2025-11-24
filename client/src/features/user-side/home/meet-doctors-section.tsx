import { Loader2, Phone } from 'lucide-react'
import { useDoctorsPublic } from '@/api/hooks/useDoctors'
import { Button } from '@/components/ui/button'
import DoctorCard from '@/components/doctor-card'

const MeetDoctorsSection = () => {
  const {
    data: doctorsResponse,
    isLoading,
    error,
  } = useDoctorsPublic({
    limit: 4, // Show only 4 doctors on the homepage
  })

  const doctors = doctorsResponse?.data || []

  if (isLoading) {
    return (
      <div className='bg-white py-16'>
        <div className='container mx-auto px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-800'>
              Meet our Doctors
            </h2>
            <p className='text-lg text-gray-600'>
              Well qualified doctors are ready to serve you.
            </p>
          </div>
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-purple-600' />
            <span className='ml-2 text-gray-600'>Loading doctors...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-white py-16'>
        <div className='container mx-auto px-6'>
          <div className='mb-12 text-center'>
            <h2 className='mb-4 text-3xl font-bold text-gray-800'>
              Meet our Doctors
            </h2>
            <p className='text-lg text-gray-600'>
              Well qualified doctors are ready to serve you.
            </p>
          </div>
          <div className='py-12 text-center'>
            <p className='mb-4 text-red-600'>Failed to load doctors</p>
            <Button onClick={() => window.location.reload()} variant='outline'>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/30 py-12'>
      {/* Background decoration */}
      <div className='bg-[url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-40'></div>

      <div className='relative container mx-auto px-6 py-10'>
        <div className='mb-10 text-center'>
          <h2 className='mb-4 bg-gradient-to-r from-gray-800 via-purple-800 to-gray-800 bg-clip-text text-3xl font-bold text-transparent'>
            Meet Our Expert Doctors
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600'>
            Our team of highly qualified and experienced doctors is dedicated to
            providing you with the best medical care and personalized treatment.
          </p>
        </div>

        {doctors.length > 0 ? (
          <div className='mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className='py-16 text-center'>
            <div className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200'>
              <Phone className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='mb-2 text-xl font-semibold text-gray-700'>
              No doctors available at the moment
            </h3>
            <p className='text-gray-500'>
              Please check back later or contact us directly
            </p>
          </div>
        )}

        {doctorsResponse?.meta?.pagination?.total &&
          doctorsResponse.meta.pagination.total > 4 && (
            <div className='mt-8 text-center'>
              <Button
                className='group relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 px-10 py-4 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/25'
                size='lg'
                onClick={() => {
                  window.location.href = '/doctors'
                }}
              >
                <div className='absolute inset-0 bg-gradient-to-r from-purple-700 via-purple-800 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
                <div className='relative flex items-center'>
                  <Phone className='mr-3 h-5 w-5 transition-transform duration-300 group-hover:scale-110' />
                  <span className='font-semibold'>
                    View All Doctors (
                    {doctorsResponse.meta.pagination.total - 4} more)
                  </span>
                </div>
              </Button>
            </div>
          )}
      </div>
    </div>
  )
}

export default MeetDoctorsSection
