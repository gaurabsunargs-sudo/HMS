import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { Doctor } from '@/schema/doctors-schema'
import { toast } from 'sonner'
import { useCreateDoctor, useUpdateDoctor } from '@/api/hooks'
import { useGetUsersWithoutProfiles } from '@/api/hooks/useUsers'
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
import SearchableDropdown from '@/components/ui/searchable-dropdown'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  userId: z.string().min(1, 'User selection is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  consultationFee: z.coerce
    .number()
    .min(0, 'Consultation fee must be a positive number'),
  qualifications: z.string().min(1, 'At least one qualification is required'),
  isAvailable: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface DoctorEnrollmentFormProps {
  doctor?: Doctor
  isEdit?: boolean
}

const DoctorEnrollmentForm = ({
  doctor,
  isEdit = false,
}: DoctorEnrollmentFormProps) => {
  const { data: usersData, isLoading: isLoadingUsers } =
    useGetUsersWithoutProfiles()

  const userOptions =
    usersData?.data?.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} (${user.username})`,
    })) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: doctor?.userId || '',
      licenseNumber: doctor?.licenseNumber || '',
      specialization: doctor?.specialization || '',
      experience: doctor?.experience || 0,
      consultationFee: doctor?.consultationFee || 0,
      qualifications: doctor?.qualifications
        ? doctor.qualifications.join(', ')
        : '',
      isAvailable: doctor?.isAvailable ?? true,
    },
  })

  const navigate = useNavigate()
  const createDoctor = useCreateDoctor()
  const updateDoctor = useUpdateDoctor()

  const handleSubmit = async (data: FormValues) => {
    const qualificationsArray = data.qualifications
      .split(',')
      .map((q) => q.trim())
      .filter((q) => q.length > 0)

    const payload = {
      ...data,
      qualifications: qualificationsArray,

      consultationFee: data.consultationFee,
    }

    if (isEdit && doctor) {
      updateDoctor.mutate(
        { id: doctor.id, updatedDoctor: payload },
        {
          onSuccess: () => {
            toast.success('Doctor updated successfully!')
            navigate({ to: '/dashboard/doctors' })
          },
          onError: (error) => {
            console.error('Failed to update doctor:', error)
            toast.error('Failed to update doctor')
          },
        }
      )
    } else {
      createDoctor.mutate(payload, {
        onSuccess: () => {
          toast.success('Doctor created successfully!')
          navigate({ to: '/dashboard/doctors' })
        },
        onError: (error) => {
          console.error('Failed to create doctor:', error)
          toast.error('Failed to create doctor')
        },
      })
    }
  }

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {!isEdit ? (
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Select User</FormLabel>
                    <FormControl>
                      <SearchableDropdown
                        options={userOptions}
                        placeholder='Search for a user...'
                        onSelect={field.onChange}
                        value={field.value}
                        isLoading={isLoadingUsers}
                        loadingText='Loading users...'
                        showCross={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormItem>
                <FormLabel required>Doctor Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={true}
                    value={`${doctor?.user.firstName} ${doctor?.user.middleName || ''} ${doctor?.user.lastName}`.trim()}
                  />
                </FormControl>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name='licenseNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>License Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter license number (e.g., MED123456)'
                      {...field}
                    />
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
                      placeholder='Enter specialization (e.g., Cardiology)'
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
              name='isAvailable'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Availability</FormLabel>
                    <p className='text-muted-foreground text-sm'>
                      Is the doctor currently available for appointments?
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
              isLoading={createDoctor.isPending || updateDoctor.isPending}
              loadingText={isEdit ? 'Updating doctor...' : 'Creating doctor...'}
            >
              {isEdit ? 'Update Doctor' : 'Register Doctor'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default DoctorEnrollmentForm
