import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useRegisterPatient } from '@/api/hooks'
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
import { PasswordInput } from '@/components/ui/password-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    required_error: 'Gender is required',
  }),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
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

const PatientRegisterForm = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      firstName: '',
      middleName: '',
      lastName: '',
      patientId: '',
      gender: undefined,
      bloodGroup: undefined,
      contactNumber: '',
      emergencyContact: '',
      address: '',
    },
  })

  const navigate = useNavigate()
  const createPatient = useRegisterPatient()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      role: 'PATIENT',
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    }

    createPatient.mutate(payload, {
      onSuccess: () => {
        toast.success('Patient created successfully!')
        navigate({ to: '/dashboard/patients' })
      },
    })
  }

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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

            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Patient ID</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter patient ID' {...field} />
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
                      <SelectItem value='A+'>A+</SelectItem>
                      <SelectItem value='A-'>A-</SelectItem>
                      <SelectItem value='B+'>B+</SelectItem>
                      <SelectItem value='B-'>B-</SelectItem>
                      <SelectItem value='AB+'>AB+</SelectItem>
                      <SelectItem value='AB-'>AB-</SelectItem>
                      <SelectItem value='O+'>O+</SelectItem>
                      <SelectItem value='O-'>O-</SelectItem>
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
              isLoading={createPatient.isPending}
              loadingText='Creating patient...'
            >
              Register Patient
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default PatientRegisterForm
