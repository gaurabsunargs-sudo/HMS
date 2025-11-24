import { createLazyFileRoute } from '@tanstack/react-router'
import {
  Heart,
  Brain,
  Baby,
  Activity,
  Shield,
  Stethoscope,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'

const HealthInfoPage = () => {
  const healthCategories = [
    {
      icon: Heart,
      title: 'Cardiovascular Health',
      description:
        'Learn about heart health, prevention, and treatment options.',
      articles: [
        'Understanding Blood Pressure',
        'Heart Disease Prevention',
        'Exercise for Heart Health',
        'Diet and Cardiovascular Wellness',
      ],
    },
    {
      icon: Brain,
      title: 'Mental Health',
      description: 'Resources for mental wellness and psychological support.',
      articles: [
        'Managing Stress and Anxiety',
        'Depression Awareness',
        'Mental Health First Aid',
        'Coping with Chronic Illness',
      ],
    },
    {
      icon: Baby,
      title: 'Pediatric Health',
      description: 'Child health information and developmental milestones.',
      articles: [
        'Childhood Vaccinations',
        'Developmental Milestones',
        'Common Childhood Illnesses',
        'Nutrition for Growing Children',
      ],
    },
    {
      icon: Activity,
      title: 'Fitness & Nutrition',
      description: 'Guidelines for healthy living and physical wellness.',
      articles: [
        'Balanced Diet Guidelines',
        'Exercise Recommendations',
        'Weight Management',
        'Hydration and Health',
      ],
    },
    {
      icon: Shield,
      title: 'Preventive Care',
      description: 'Screening tests and preventive health measures.',
      articles: [
        'Cancer Screening Guidelines',
        'Immunization Schedules',
        'Health Checkups by Age',
        'Early Detection Benefits',
      ],
    },
    {
      icon: Stethoscope,
      title: 'Chronic Conditions',
      description: 'Managing long-term health conditions effectively.',
      articles: [
        'Diabetes Management',
        'Hypertension Control',
        'Arthritis Care',
        'Respiratory Conditions',
      ],
    },
  ]

  const emergencyInfo = [
    {
      icon: AlertTriangle,
      title: 'When to Call 911',
      description:
        'Recognize the signs of medical emergencies that require immediate attention.',
    },
    {
      icon: Heart,
      title: 'Heart Attack Symptoms',
      description: 'Learn the warning signs of a heart attack and what to do.',
    },
    {
      icon: Brain,
      title: 'Stroke Symptoms',
      description: 'Know the FAST method to identify stroke symptoms quickly.',
    },
    {
      icon: Baby,
      title: 'Pediatric Emergencies',
      description: 'When to seek immediate medical care for children.',
    },
  ]

  const healthTips = [
    {
      title: 'Stay Hydrated',
      description:
        'Drink at least 8 glasses of water daily for optimal health.',
      icon: '💧',
    },
    {
      title: 'Get Regular Exercise',
      description:
        'Aim for at least 150 minutes of moderate exercise per week.',
      icon: '🏃‍♂️',
    },
    {
      title: 'Eat a Balanced Diet',
      description:
        'Include fruits, vegetables, whole grains, and lean proteins.',
      icon: '🥗',
    },
    {
      title: 'Get Enough Sleep',
      description: 'Adults need 7-9 hours of quality sleep each night.',
      icon: '😴',
    },
    {
      title: 'Manage Stress',
      description:
        'Practice relaxation techniques and maintain work-life balance.',
      icon: '🧘‍♀️',
    },
    {
      title: 'Regular Checkups',
      description: 'Schedule annual health screenings and preventive care.',
      icon: '🏥',
    },
  ]

  return (
    <div>
      <Navigation />
      <PageHeader title='Health Information Center' />
      <div className='min-h-screen bg-gray-50 pt-20'>
        {/* Hero Section */}
        <div className='bg-gradient-to-br from-blue-50 to-purple-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='text-center'>
              <h1 className='mb-4 text-4xl font-bold text-gray-800'>
                Health Information Center
              </h1>
              <p className='mx-auto max-w-3xl text-lg text-gray-600'>
                Access reliable health information, wellness tips, and
                educational resources to help you make informed decisions about
                your health.
              </p>
            </div>
          </div>
        </div>

        {/* Health Categories */}
        <div className='bg-white py-16'>
          <div className='container mx-auto px-6'>
            <div className='mb-12 text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Health Topics
              </h2>
              <p className='text-lg text-gray-600'>
                Explore comprehensive health information by category
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {healthCategories.map((category, index) => (
                <Card
                  key={index}
                  className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                  <CardContent className='p-6'>
                    <category.icon className='mb-4 h-12 w-12 text-purple-600' />
                    <h3 className='mb-3 text-xl font-bold text-gray-800'>
                      {category.title}
                    </h3>
                    <p className='mb-4 text-gray-600'>{category.description}</p>
                    <ul className='space-y-2 text-sm text-gray-600'>
                      {category.articles.map((article, idx) => (
                        <li key={idx} className='flex items-center'>
                          <span className='mr-2 text-purple-600'>•</span>
                          {article}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant='outline'
                      className='mt-4 w-full border-purple-600 text-purple-600 hover:bg-purple-50'
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Information */}
        <div className='bg-red-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='mb-12 text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Emergency Information
              </h2>
              <p className='text-lg text-gray-600'>
                Important information for medical emergencies
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
              {emergencyInfo.map((info, index) => (
                <Card key={index} className='bg-white shadow-lg'>
                  <CardContent className='p-6 text-center'>
                    <info.icon className='mx-auto mb-4 h-12 w-12 text-red-600' />
                    <h3 className='mb-3 text-lg font-bold text-gray-800'>
                      {info.title}
                    </h3>
                    <p className='text-sm text-gray-600'>{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className='mt-8 text-center'>
              <Card className='bg-red-600 text-white shadow-lg'>
                <CardContent className='p-8'>
                  <h3 className='mb-4 text-2xl font-bold'>Emergency Hotline</h3>
                  <a
                    href='tel:9810325922'
                    className='mb-4 text-4xl font-bold transition-colors hover:text-red-300'
                  >
                    9810325922
                  </a>
                  <p className='text-lg'>
                    Available 24/7 for life-threatening emergencies
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Health Tips */}
        <div className='bg-white py-16'>
          <div className='container mx-auto px-6'>
            <div className='mb-12 text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Daily Health Tips
              </h2>
              <p className='text-lg text-gray-600'>
                Simple steps to maintain your health and wellness
              </p>
            </div>

            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {healthTips.map((tip, index) => (
                <Card
                  key={index}
                  className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                >
                  <CardContent className='p-6'>
                    <div className='mb-4 text-4xl'>{tip.icon}</div>
                    <h3 className='mb-3 text-lg font-bold text-gray-800'>
                      {tip.title}
                    </h3>
                    <p className='text-gray-600'>{tip.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className='bg-gray-50 py-16'>
          <div className='container mx-auto px-6'>
            <div className='text-center'>
              <h2 className='mb-4 text-3xl font-bold text-gray-800'>
                Additional Resources
              </h2>
              <p className='mb-8 text-lg text-gray-600'>
                More ways to stay informed about your health
              </p>
              <div className='flex flex-col justify-center gap-4 sm:flex-row'>
                <Button className='bg-purple-600 text-white hover:bg-purple-700'>
                  <Calendar className='mr-2 h-4 w-4' />
                  Schedule Health Checkup
                </Button>
                <Button
                  variant='outline'
                  className='border-purple-600 text-purple-600 hover:bg-purple-50'
                >
                  <FileText className='mr-2 h-4 w-4' />
                  Download Health Guides
                </Button>
                <Button
                  variant='outline'
                  className='border-purple-600 text-purple-600 hover:bg-purple-50'
                >
                  <Users className='mr-2 h-4 w-4' />
                  Join Health Programs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/health-info')({
  component: HealthInfoPage,
})
