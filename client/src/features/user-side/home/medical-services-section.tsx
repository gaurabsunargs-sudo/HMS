import {
  Microscope,
  Ambulance,
  Monitor,
  Phone,
  Clock,
  Shield,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const MedicalServicesSection = () => {
  const services = [
    {
      icon: Microscope,
      title: 'Our Laboratory',
      description:
        'We use the latest technology to give you accurate test results quickly, so you can focus on getting better.',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      iconColor: 'text-white',
      textColor: 'text-gray-800',
      accentColor: 'text-blue-600',
      features: [
        'Results in hours, not days',
        'Gentle testing process',
        'Your comfort matters',
      ],
    },
    {
      icon: Ambulance,
      title: 'Emergency Care',
      description:
        'When every second counts, our trained team is ready to help you or your loved ones get the care you need.',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-100',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-600',
      iconColor: 'text-white',
      textColor: 'text-gray-800',
      accentColor: 'text-red-600',
      features: [
        'Always here for you',
        'Compassionate care',
        'Family-friendly approach',
      ],
    },
    {
      icon: Monitor,
      title: 'Online Appointments',
      description:
        'Skip the waiting room. Connect with our doctors from home and get the care you need, when you need it.',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-100',
      iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
      iconColor: 'text-white',
      textColor: 'text-gray-800',
      accentColor: 'text-green-600',
      features: [
        'No travel needed',
        'Same quality care',
        'Prescriptions delivered',
      ],
    },
    {
      icon: Phone,
      title: "We're Here to Help",
      description:
        'Have questions? Need guidance? Our friendly team is just a call away, ready to support you and your family.',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-100',
      iconBg: 'bg-gradient-to-br from-purple-500 to-violet-600',
      iconColor: 'text-white',
      textColor: 'text-gray-800',
      accentColor: 'text-purple-600',
      features: ['Friendly voices', 'Patient support', 'No question too small'],
    },
  ]

  return (
    <div className='relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16'>
      {/* Background decoration */}
      <div className='bg-[url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366F1" fill-opacity="0.03"%3E%3Ccircle cx="20" cy="20" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")] absolute inset-0 opacity-60'></div>

      <div className='relative container mx-auto px-6'>
        <div className='mb-12 text-center'>
          <div className='mb-4 inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2'>
            <Shield className='mr-2 h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-700'>
              Caring for You & Your Family
            </span>
          </div>
          <h2 className='mb-4 bg-gradient-to-r from-gray-800 via-blue-800 to-gray-800 bg-clip-text text-3xl font-bold text-transparent'>
            How We Care for You
          </h2>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-gray-600'>
            Every service we offer is designed with you in mind. We believe
            healthcare should be personal, accessible, and focused on what
            matters most - your health and peace of mind.
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {services.map((service, index) => (
            <Card
              key={index}
              className={`group relative overflow-hidden border-2 border-dashed ${service.accentColor.replace('text-', 'border-')} ${service.bgColor} shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20`}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Card gradient overlay */}
              <div className='absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>

              <CardContent className='relative p-6'>
                {/* Icon */}
                <div className='mb-4 flex justify-center'>
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${service.iconBg} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                  >
                    <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className='text-center'>
                  <h3
                    className={`mb-2 text-lg font-bold ${service.textColor} transition-colors duration-300 group-hover:${service.accentColor}`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`mb-4 text-sm ${service.textColor} leading-relaxed opacity-80`}
                  >
                    {service.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='mt-12 text-center'>
          <div className='mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-8 shadow-2xl'>
            <div className='mb-4 flex justify-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm'>
                <Users className='h-6 w-6 text-white' />
              </div>
            </div>
            <h3 className='mb-2 text-xl font-bold text-white'>
              We're Here When You Need Us
            </h3>
            <p className='mb-4 text-blue-100'>
              Whether it's a simple question or an emergency, our caring team is
              ready to help you and your family anytime, day or night.
            </p>
            <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
              <a
                href='tel:9810325922'
                className='inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-blue-600 transition-colors hover:bg-blue-50'
              >
                <Phone className='mr-2 h-4 w-4' />
                Call Now: 9810325922
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalServicesSection
