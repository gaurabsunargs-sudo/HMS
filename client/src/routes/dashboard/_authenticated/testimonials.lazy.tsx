import { createLazyFileRoute } from '@tanstack/react-router'
import TestimonialsManagement from '@/features/testimonials/admin-management'

const TestimonialsAdminPage = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='p-6'>
        <TestimonialsManagement />
      </div>
    </div>
  )
}

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/testimonials'
)({
  component: TestimonialsAdminPage,
})
