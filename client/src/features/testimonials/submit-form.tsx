import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateTestimonial } from '@/api/hooks/useTestimonials'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const testimonialSchema = z.object({
  patientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  patientRole: z
    .string()
    .min(2, 'Role must be at least 2 characters')
    .max(100, 'Role must be less than 100 characters'),
  testimonialText: z
    .string()
    .min(10, 'Testimonial must be at least 10 characters')
    .max(500, 'Testimonial must be less than 500 characters'),
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating must be between 1 and 5'),
  department: z.string().optional(),
})

type TestimonialFormData = z.infer<typeof testimonialSchema>

const TestimonialSubmissionForm = () => {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const createTestimonial = useCreateTestimonial()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TestimonialFormData>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      rating: 0,
    },
  })

  const onSubmit = async (data: TestimonialFormData) => {
    try {
      await createTestimonial.mutateAsync({
        ...data,
        rating,
      })

      setIsSubmitted(true)
      reset()
      setRating(0)

      toast.success(
        'Testimonial submitted successfully! It will be reviewed before being published.'
      )

      // Reset submitted state after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000)
    } catch (error) {
      toast.error('Failed to submit testimonial. Please try again.')
    }
  }

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
    setValue('rating', selectedRating)
  }

  const renderStars = (currentRating: number, isInteractive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-6 w-6 transition-colors ${
          isInteractive ? 'cursor-pointer' : ''
        } ${
          i < currentRating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={isInteractive ? () => handleRatingClick(i + 1) : undefined}
        onMouseEnter={isInteractive ? () => setHoveredRating(i + 1) : undefined}
        onMouseLeave={isInteractive ? () => setHoveredRating(0) : undefined}
      />
    ))
  }

  if (isSubmitted) {
    return (
      <Card className='mx-auto max-w-2xl'>
        <CardContent className='p-8 text-center'>
          <CheckCircle className='mx-auto mb-4 h-16 w-16 text-green-500' />
          <h3 className='mb-2 text-2xl font-bold text-gray-800'>Thank You!</h3>
          <p className='text-gray-600'>
            Your testimonial has been submitted successfully. It will be
            reviewed by our team before being published on the website.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='mx-auto max-w-2xl'>
      <CardHeader>
        <CardTitle className='text-center text-2xl font-bold text-gray-800'>
          Share Your Experience
        </CardTitle>
        <p className='text-center text-gray-600'>
          Help others by sharing your experience with our hospital
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* Patient Name */}
          <div>
            <Label htmlFor='patientName'>Your Name *</Label>
            <Input
              id='patientName'
              {...register('patientName')}
              placeholder='Enter your full name'
              className='mt-1'
            />
            {errors.patientName && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.patientName.message}
              </p>
            )}
          </div>

          {/* Patient Role */}
          <div>
            <Label htmlFor='patientRole'>Your Role/Title *</Label>
            <Input
              id='patientRole'
              {...register('patientRole')}
              placeholder='e.g., Patient, Family Member, Visitor'
              className='mt-1'
            />
            {errors.patientRole && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.patientRole.message}
              </p>
            )}
          </div>

          {/* Department */}
          <div>
            <Label htmlFor='department'>Department (Optional)</Label>
            <Select onValueChange={(value) => setValue('department', value)}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Select department if applicable' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cardiology'>Cardiology</SelectItem>
                <SelectItem value='neurology'>Neurology</SelectItem>
                <SelectItem value='orthopedics'>Orthopedics</SelectItem>
                <SelectItem value='pediatrics'>Pediatrics</SelectItem>
                <SelectItem value='emergency'>Emergency</SelectItem>
                <SelectItem value='surgery'>Surgery</SelectItem>
                <SelectItem value='oncology'>Oncology</SelectItem>
                <SelectItem value='dermatology'>Dermatology</SelectItem>
                <SelectItem value='psychiatry'>Psychiatry</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Rating */}
          <div>
            <Label>Rating *</Label>
            <div className='mt-2 flex items-center space-x-1'>
              {renderStars(hoveredRating || rating, true)}
              <span className='ml-2 text-sm text-gray-600'>
                {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
              </span>
            </div>
            {errors.rating && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Testimonial Text */}
          <div>
            <Label htmlFor='testimonialText'>Your Testimonial *</Label>
            <Textarea
              id='testimonialText'
              {...register('testimonialText')}
              placeholder='Share your experience with our hospital...'
              className='mt-1 min-h-[120px]'
              maxLength={500}
            />
            <div className='mt-1 flex justify-between text-sm text-gray-500'>
              <span>Minimum 10 characters</span>
              <span>{watch('testimonialText')?.length || 0}/500</span>
            </div>
            {errors.testimonialText && (
              <p className='mt-1 text-sm text-red-600'>
                {errors.testimonialText.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={createTestimonial.isPending || rating === 0}
          >
            {createTestimonial.isPending ? (
              <>
                <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Submitting...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Submit Testimonial
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default TestimonialSubmissionForm
