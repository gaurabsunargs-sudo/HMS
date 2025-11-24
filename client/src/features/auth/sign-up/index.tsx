import { Link } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import AuthLayout from '../auth-layout'
import { SignUpForm } from './components/sign-up-form'

export default function SignUp() {
  return (
    <AuthLayout>

      <Card className='w-4xl rounded-2xl p-8 shadow-lg'>
        <div className='mb-6 text-start'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Create your account
          </h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Sign up to get started with your journey
          </p>
        </div>

        <SignUpForm />

        <p className='text-muted-foreground mt-6 text-center text-sm'>
          Already have an account?{' '}
          <Link
            to='/sign-in'
            className='text-primary hover:text-primary/80 font-medium underline underline-offset-4'
          >
            Sign In
          </Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
