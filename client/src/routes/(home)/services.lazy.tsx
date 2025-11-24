import { createLazyFileRoute } from '@tanstack/react-router'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'

const ServicesPage = () => {
  return (
    <div>
      <Navigation />
      <PageHeader title='Our Services' />
      <div className='min-h-screen bg-white pt-20'>
        <div className='container mx-auto px-6 py-16'>
          <div className='mb-12 text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-800'>
              Our Services
            </h1>
            <p className='mx-auto max-w-2xl text-lg text-gray-600'>
              We provide comprehensive healthcare services with state-of-the-art
              facilities and experienced medical professionals.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {/* Emergency Services */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100'>
                <span className='text-2xl'>🚑</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Emergency Care
              </h3>
              <p className='mb-4 text-gray-600'>
                24/7 emergency services with rapid response teams and advanced
                life support equipment.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• Trauma Center</li>
                <li>• Cardiac Emergency</li>
                <li>• Stroke Unit</li>
                <li>• Pediatric Emergency</li>
              </ul>
            </div>

            {/* Diagnostic Services */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100'>
                <span className='text-2xl'>🔬</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Diagnostic Services
              </h3>
              <p className='mb-4 text-gray-600'>
                Advanced diagnostic imaging and laboratory services for accurate
                medical assessments.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• MRI & CT Scan</li>
                <li>• Laboratory Tests</li>
                <li>• Ultrasound</li>
                <li>• X-Ray Services</li>
              </ul>
            </div>

            {/* Surgical Services */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100'>
                <span className='text-2xl'>⚕️</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Surgical Services
              </h3>
              <p className='mb-4 text-gray-600'>
                Minimally invasive and traditional surgical procedures performed
                by expert surgeons.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• General Surgery</li>
                <li>• Orthopedic Surgery</li>
                <li>• Cardiac Surgery</li>
                <li>• Neurosurgery</li>
              </ul>
            </div>

            {/* Specialized Care */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100'>
                <span className='text-2xl'>🏥</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Specialized Care
              </h3>
              <p className='mb-4 text-gray-600'>
                Specialized medical departments providing focused care for
                specific conditions.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• Cardiology</li>
                <li>• Neurology</li>
                <li>• Oncology</li>
                <li>• Pediatrics</li>
              </ul>
            </div>

            {/* Rehabilitation */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100'>
                <span className='text-2xl'>🏃‍♂️</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Rehabilitation
              </h3>
              <p className='mb-4 text-gray-600'>
                Comprehensive rehabilitation services to help patients recover
                and regain independence.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• Physical Therapy</li>
                <li>• Occupational Therapy</li>
                <li>• Speech Therapy</li>
                <li>• Cardiac Rehab</li>
              </ul>
            </div>

            {/* Preventive Care */}
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-lg'>
              <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100'>
                <span className='text-2xl'>🛡️</span>
              </div>
              <h3 className='mb-3 text-xl font-bold text-gray-800'>
                Preventive Care
              </h3>
              <p className='mb-4 text-gray-600'>
                Proactive healthcare services focused on prevention and early
                detection of diseases.
              </p>
              <ul className='space-y-1 text-sm text-gray-600'>
                <li>• Health Checkups</li>
                <li>• Vaccinations</li>
                <li>• Health Screenings</li>
                <li>• Wellness Programs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/services')({
  component: ServicesPage,
})
