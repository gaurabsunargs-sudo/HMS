import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { serverUrl } from '@/api/server-url'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import DatePicker from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z
  .object({
    username: z.string().min(1, { message: 'Please enter a username' }),
    email: z
      .string()
      .min(1, { message: 'Please enter your email' })
      .email({ message: 'Invalid email address' }),
    firstName: z.string().min(1, { message: 'Please enter your first name' }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: 'Please enter your last name' }),
    // Patient-specific fields
    dateOfBirth: z.date({ required_error: 'Please select your date of birth' }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
      required_error: 'Please select your gender',
    }),
    bloodGroup: z.string().min(1, { message: 'Please enter your blood group' }),
    contactNumber: z
      .string()
      .min(1, { message: 'Please enter your contact number' })
      .regex(/^[0-9+\-\s()]+$/, {
        message: 'Please enter a valid phone number',
      }),
    emergencyContact: z
      .string()
      .min(1, { message: 'Please enter an emergency contact number' })
      .regex(/^[0-9+\-\s()]+$/, {
        message: 'Please enter a valid phone number',
      }),
    address: z.string().min(1, { message: 'Please enter your address' }),
    password: z
      .string()
      .min(1, { message: 'Please enter your password' })
      .min(7, { message: 'Password must be at least 7 characters long' })
      .regex(/[a-z]/, {
        message: 'Password must contain at least one lowercase letter',
      })
      .regex(/[A-Z]/, {
        message: 'Password must contain at least one uppercase letter',
      })
      .regex(/[0-9]/, { message: 'Password must contain at least one number' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Password must contain at least one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: undefined,
      gender: undefined,
      bloodGroup: '',
      contactNumber: '',
      emergencyContact: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 7) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1
    setPasswordStrength(strength)
  }

  // React Query mutation
  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        role: 'PATIENT',
        // Patient-specific fields
        dateOfBirth: data.dateOfBirth.toISOString(),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        contactNumber: data.contactNumber,
        emergencyContact: data.emergencyContact,
        address: data.address,
      }

      const res = await axios.post(`${serverUrl}/auth/register`, payload, {
        headers: { 'Content-Type': 'application/json' },
      })
      return res.data
    },
    onSuccess: () => {
      setShowSuccess(true)
      // TODO: redirect to sign-in or auto-login
    },
    onError: (err: any) => {
      console.error('Registration failed:', err.response?.data || err.message)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    mutation.mutate(data)
  }

  const navigate = useNavigate()

  if (showSuccess) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-6 text-center',
          className
        )}
        {...props}
      >
        <div className='mb-4 rounded-full bg-green-100 p-3'>
          <CheckCircle2 className='h-8 w-8 text-green-600' />
        </div>
        <h3 className='mb-2 text-2xl font-bold'>
          Account Created Successfully!
        </h3>
        <p className='text-muted-foreground mb-6'>
          Your account has been created. You can now sign in to access your
          dashboard.
        </p>
        <Button onClick={() => navigate({ to: '/sign-in' })} className='w-full'>
          Continue to Sign In
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6 ', className)} {...props}>
      {mutation.isError && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {mutation.error?.response?.data?.message ||
              mutation.error?.message ||
              'An error occurred during registration. Please try again.'}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Personal Information Section */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>Personal Information</h3>
              <p className='text-muted-foreground text-sm'>
                Please provide your basic information
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='middleName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='email'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Divider */}
          <div className='border-border border-t' />

          {/* Patient Information Section */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>Patient Information</h3>
              <p className='text-muted-foreground text-sm'>
                Medical and contact details for your patient profile
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='dateOfBirth'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Select your date of birth'
                        disableFuture
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
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
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='bloodGroup'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='contactNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='emergencyContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Divider */}
          <div className='border-border border-t' />

          {/* Security Section */}
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-semibold'>Security</h3>
              <p className='text-muted-foreground text-sm'>
                Create a strong password to protect your account
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <PasswordInput
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            calculatePasswordStrength(e.target.value)
                          }}
                        />
                      </div>
                    </FormControl>
                    <div className='mt-2'>
                      <div className='bg-muted flex h-1.5 overflow-hidden rounded-full'>
                        <div
                          className={`transition-all ${passwordStrength <= 2
                            ? 'bg-red-500'
                            : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {passwordStrength === 0
                          ? 'Very weak'
                          : passwordStrength <= 2
                            ? 'Weak'
                            : passwordStrength <= 3
                              ? 'Medium'
                              : 'Strong'}{' '}
                        password
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            className='mt-6 w-full'
            disabled={mutation.isPending}
            size='lg'
          >
            {mutation.isPending ? (
              <>
                <div className='border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent' />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
