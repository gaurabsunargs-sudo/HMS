import { createLazyFileRoute } from '@tanstack/react-router'
import Footer from '@/components/common/footer'
import Navigation from '@/components/common/nav'
import PageHeader from '@/components/common/page-header'
import TestimonialSubmissionForm from '@/features/testimonials/submit-form'

const TestimonialSubmitPage = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <PageHeader title='Share Your Experience' />
      <div className='pt-20 pb-16'>
        <div className='container mx-auto px-6'>
          <div className='mb-8 text-center'>
            <h1 className='mb-4 text-4xl font-bold text-gray-800'>
              Share Your Experience
            </h1>
            <p className='text-lg text-gray-600'>
              Help others by sharing your experience with our hospital
            </p>
          </div>
          <TestimonialSubmissionForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export const Route = createLazyFileRoute('/(home)/testimonial-submit')({
  component: TestimonialSubmitPage,
})
