import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useRegisterDoctor } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  consultationFee: z.coerce.number().min(0, 'Fee must be a positive number'),
  qualifications: z.string().min(1, 'Qualifications are required'),
})

type FormValues = z.infer<typeof formSchema>

const DoctorRegisterForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      middleName: '',
      lastName: '',
      licenseNumber: '',
      specialization: '',
      experience: 0,
      consultationFee: 0,
      qualifications: '',
    },
  })

  const navigate = useNavigate()
  const createDoctor = useRegisterDoctor()

  const handleSubmit = async (data: FormValues) => {
    // Convert qualifications string to array
    const qualificationsArray = data.qualifications
      .split(',')
      .map((q) => q.trim())
      .filter((q) => q.length > 0)

    const payload = {
      ...data,
      qualifications: qualificationsArray,
      middleName: data.middleName || undefined, // Ensure empty string becomes undefined
    }

    createDoctor.mutate(payload, {
      onSuccess: () => {
        toast.success('Doctor registered successfully!')
        navigate({ to: '/dashboard/doctors' })
      },
    })
  }

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Personal Information */}
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter username' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email</FormLabel>
                  <FormControl>
                    <Input type='email' placeholder='Enter email' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='Enter password' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='firstName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter first name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='middleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter middle name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='lastName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter last name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Professional Information */}
            <FormField
              control={form.control}
              name='licenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>License Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter license number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='specialization'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Specialization</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g., Cardiology, Neurology'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='experience'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Experience (years)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      placeholder='Enter years of experience'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='consultationFee'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Consultation Fee (Rs)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min='0'
                      step='0.01'
                      placeholder='Enter consultation fee'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='qualifications'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Qualifications</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter qualifications separated by commas (e.g., MD, Board Certified, PhD)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/dashboard/doctors' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createDoctor.isPending}
              loadingText='Registering doctor...'
            >
              Register Doctor
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default DoctorRegisterForm
