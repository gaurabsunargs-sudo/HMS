// Healthcare Services Section
import { Brain, FileText, Calendar, Users } from 'lucide-react'
import { NumberTicker } from '@/components/ui/number-ticker'

const ServicesSection = () => {
  return (
    <div className='z-30 w-full pt-10 lg:pt-0'>
      <div className='relative hidden w-full object-cover lg:block'>
        <img
          src='/sep.png'
          alt='Top Separator'
          className='absolute bottom-[-30px] w-full object-contain'
        />
        <h2 className='absolute top-[-140px] z-10 flex w-full flex-col pl-32 2xl:top-[-150px] 2xl:pl-32'>
          <span className='outlined-text text-6xl font-bold tracking-wide'>
            <NumberTicker value={24} className='outlined-text' />
          </span>
          <span className='mt-2 text-xl text-gray-700 italic'>
            Hours Emergency Care
          </span>
        </h2>
      </div>

      <div className='relative z-40 bg-white'>
        <div className='container mx-auto grid w-[90%] grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {[
            {
              icon: Brain,
              title: 'AI Disease Prediction',
              description:
                'Advanced machine learning algorithms for accurate disease diagnosis and early detection using patient symptoms.',
              stroke: '#2563eb', // blue-600
            },
            {
              icon: FileText,
              title: 'Digital Health Records',
              description:
                'Secure electronic health records accessible across all devices with real-time updates and HIPAA compliance.',
              stroke: '#16a34a', // green-600
            },
            {
              icon: Calendar,
              title: 'Appointment Management',
              description:
                'Streamlined appointment booking, scheduling, and management system for patients and healthcare providers.',
              stroke: '#9333ea', // purple-600
            },
            {
              icon: Users,
              title: 'Integrated Care System',
              description:
                'Comprehensive healthcare management platform connecting doctors, patients, and administrative staff seamlessly.',
              stroke: '#db2777', // pink-600
            },
          ].map((service, index) => (
            <div
              key={index}
              className='group flex flex-col rounded-2xl bg-gray-50 p-6 text-start shadow-sm transition-shadow duration-300 hover:shadow-md'
            >
              <div
                className='mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-[1.03]'
                style={{
                  backgroundColor: `${service.stroke}1A`,
                  border: `1px solid ${service.stroke}80`,
                }}
              >
                <service.icon
                  className='h-8 w-8'
                  style={{
                    color: service.stroke,
                  }}
                />
              </div>
              <h4 className='mb-1 text-lg font-semibold tracking-tight text-gray-900'>
                {service.title}
              </h4>
              <p className='text-sm leading-relaxed text-gray-600'>
                {service.description}
              </p>
            </div>
          ))}
        </div>
        <div className='w-full overflow-hidden leading-[0]'>
          <svg
            className='relative block h-[120px] w-full rotate-y-180 bg-white'
            xmlns='http://www.w3.org/2000/svg'
            preserveAspectRatio='none'
            viewBox='0 0 1600 257'
          >
            <path
              d='M-7-10H1618V288H-7V-10ZM173.416,229.5L1611.94,3.759a50,50,0,0,0,42.21-56.729l-44.42-302.759A50,50,0,0,0,1553-397.94L-34.024-172.2a50,50,0,0,0-42.212,56.729L116.687,187.289C136.2,218.611,146.844,232.009,173.416,229.5Z'
              fill='#f3f4f6'
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default ServicesSection
