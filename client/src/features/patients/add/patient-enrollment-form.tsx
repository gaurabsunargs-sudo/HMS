import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { Patient } from '@/schema/patients-schema'
import { toast } from 'sonner'
import { useCreatePatient, useUpdatePatient } from '@/api/hooks'
import { useGetUsersWithoutProfiles } from '@/api/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DatePicker from '@/components/ui/date-picker'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Define blood group and gender types explicitly
const bloodGroupValues = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const
const genderValues = ['MALE', 'FEMALE', 'OTHER'] as const

const formSchema = z.object({
  userId: z.string().min(1, 'User selection is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(genderValues, {
    required_error: 'Gender is required',
  }),
  bloodGroup: z.enum(bloodGroupValues, {
    required_error: 'Blood group is required',
  }),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^[0-9]+$/, 'Contact number must contain only numbers'),
  emergencyContact: z
    .string()
    .min(1, 'Emergency contact is required')
    .regex(/^[0-9]+$/, 'Emergency contact must contain only numbers'),
  address: z.string().min(1, 'Address is required'),
})

type FormValues = z.infer<typeof formSchema>

interface PatientEnrollmentFormProps {
  patient?: Patient & {
    currentMedications?: string
  }
  isEdit?: boolean
}

const PatientEnrollmentForm = ({
  patient,
  isEdit = false,
}: PatientEnrollmentFormProps) => {
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
      userId: patient?.userId || '',
      patientId: patient?.patientId || '',
      dateOfBirth: patient?.dateOfBirth
        ? new Date(patient.dateOfBirth)
        : undefined,
      gender: patient?.gender as (typeof genderValues)[number] | undefined,
      bloodGroup: patient?.bloodGroup as
        | (typeof bloodGroupValues)[number]
        | undefined,
      contactNumber: patient?.contactNumber || '',
      emergencyContact: patient?.emergencyContact || '',
      address: patient?.address || '',
    },
  })

  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    }

    if (isEdit && patient) {
      updatePatient.mutate(
        { id: patient.id, updatedPatient: payload },
        {
          onSuccess: () => {
            toast.success('Patient updated successfully!')
            navigate({ to: '/dashboard/patients' })
          },
          onError: (error) => {
            console.error('Failed to update patient:', error)
            toast.error('Failed to update patient')
          },
        }
      )
    } else {
      createPatient.mutate(payload, {
        onSuccess: () => {
          toast.success('Patient created successfully!')
          navigate({ to: '/dashboard/patients' })
        },
        onError: (error) => {
          console.error('Failed to create patient:', error)
          toast.error('Failed to create patient')
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
                <FormLabel required>Your User Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isEdit}
                    value={
                      patient?.user.firstName +
                      ' ' +
                      patient?.user.middleName +
                      ' ' +
                      patient?.user.lastName
                    }
                  />
                </FormControl>
              </FormItem>
            )}

            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {isEdit ? 'Your Last Patient ID Is' : 'Patient ID'}{' '}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter patient ID'
                      {...field}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dateOfBirth'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel required>Date of Birth</FormLabel>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disableFuture={true}
                    placeholder='Select date of birth'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='MALE'>Male</SelectItem>
                      <SelectItem value='FEMALE'>Female</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='bloodGroup'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Blood Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select blood group' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bloodGroupValues.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contactNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter contact number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='emergencyContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Emergency Contact</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter emergency contact' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter full address' {...field} />
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
              onClick={() => navigate({ to: '/dashboard/patients' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createPatient.isPending || updatePatient.isPending}
              loadingText={
                isEdit ? 'Updating patient...' : 'Creating patient...'
              }
            >
              {isEdit ? 'Update Patient' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default PatientEnrollmentForm
