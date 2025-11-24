import { createLazyFileRoute } from '@tanstack/react-router'
import { HeartPulse, Award, Users, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import DynamicStatsSection from '@/components/common/dynamic-stats-section'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'

const AboutPage = () => {
  const values = [
    {
      icon: HeartPulse,
      title: 'Patient-Centered Care',
      description:
        "We prioritize our patients' well-being and comfort in every aspect of our healthcare delivery.",
    },
    {
      icon: Shield,
      title: 'Quality & Safety',
      description:
        'Maintaining the highest standards of medical care and patient safety is our top priority.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Our multidisciplinary teams work together to provide comprehensive and coordinated care.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description:
        'We strive for excellence in all our services, continuously improving our medical practices.',
    },
  ]

  return (
    <div>
      <Navigation />
      <PageHeader title='About PulsePoint Hospital' />
      <div className='min-h-screen bg-white pt-20'>
        {/* Stats Section */}
        <div className='bg-white py-16'>
          <div className='container mx-auto px-6'>
            <DynamicStatsSection />
          </div>
        </div>

        {/* Mission & Vision */}
        <div className='bg-gray-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='grid gap-12 lg:grid-cols-2'>
              <Card className='shadow-lg'>
                <CardContent className='p-8'>
                  <h2 className='mb-4 text-2xl font-bold text-gray-800'>
                    Our Mission
                  </h2>
                  <p className='leading-relaxed text-gray-600'>
                    To provide exceptional healthcare services that improve the
                    health and well-being of our community through compassionate
                    care, advanced medical technology, and continuous innovation
                    in medical practices.
                  </p>
                </CardContent>
              </Card>

              <Card className='shadow-lg'>
                <CardContent className='p-8'>
                  <h2 className='mb-4 text-2xl font-bold text-gray-800'>
                    Our Vision
                  </h2>
                  <p className='leading-relaxed text-gray-600'>
                    To be the leading healthcare provider in the region,
                    recognized for our excellence in patient care, medical
                    innovation, and commitment to improving the health outcomes
                    of our community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className='bg-white py-16'>
          <div className='container mx-auto px-6'>
            <div className='mb-12 text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Our Values
              </h2>
              <p className='text-lg text-gray-600'>
                The principles that guide everything we do at PulsePoint
                Hospital
              </p>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
              {values.map((value, index) => (
                <Card
                  key={index}
                  className='text-center shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                  <CardContent className='p-6'>
                    <value.icon className='mx-auto mb-4 h-12 w-12 text-purple-600' />
                    <h3 className='mb-3 text-lg font-bold text-gray-800'>
                      {value.title}
                    </h3>
                    <p className='text-sm text-gray-600'>{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/about')({
  component: AboutPage,
})
