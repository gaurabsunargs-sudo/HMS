import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
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
import { useNavigate } from '@tanstack/react-router'
import { toast } from '@/hooks/use-toast'
import { serverUrl } from '@/api/server-url'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: 'OTP must be 6 digits' })
    .max(6, { message: 'OTP must be 6 digits' }),
})

const passwordSchema = z.object({
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'EMAIL' | 'OTP' | 'PASSWORD'>('EMAIL')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        setEmail(data.email)
        setStep('OTP')
        toast({
          title: 'Success',
          description: 'OTP sent to your email',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to send OTP',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: data.otp }),
      })
      const result = await response.json()

      if (result.success) {
        setOtp(data.otp)
        setStep('PASSWORD')
        toast({
          title: 'Success',
          description: 'OTP verified',
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Invalid OTP',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onPasswordSubmit(data: z.infer<typeof passwordSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`${serverUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password: data.password }),
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Password reset successfully',
        })
        navigate({ to: '/sign-in' })
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to reset password',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      {step === 'EMAIL' && (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={emailForm.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='name@example.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 'OTP' && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOtpSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={otpForm.control}
                name='otp'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <Input placeholder='123456' {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type='button'
                variant='ghost'
                className='mt-1'
                onClick={() => setStep('EMAIL')}
                disabled={isLoading}
              >
                Back to Email
              </Button>
            </div>
          </form>
        </Form>
      )}

      {step === 'PASSWORD' && (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div className='grid gap-2'>
              <FormField
                control={passwordForm.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='******' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='space-y-1'>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='******' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className='mt-2' disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
