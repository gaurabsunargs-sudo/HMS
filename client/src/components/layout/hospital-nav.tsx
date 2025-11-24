import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Heart,
  Phone,
  Calendar,
  Menu,
  X,
  User,
  LogOut,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

export const HospitalNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated, reset } = useAuthStore()

  const handleLogout = () => {
    reset()
    navigate({ to: '/' })
  }

  const handleBookAppointment = () => {
    if (isAuthenticated) {
      navigate({ to: '/appointments/new' })
    } else {
      navigate({ to: '/login' })
    }
  }

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Doctors', href: '/doctors' },
    { name: 'About Us', href: '/about-us' },
    { name: 'Health Info', href: '/desease' },
    { name: 'FAQ', href: '/faq' },
  ]

  return (
    <nav className='sticky top-0 z-50 bg-white shadow-lg'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600'>
              <Heart className='h-6 w-6 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-900'>
              Hospital Name
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center space-x-8 md:flex'>
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className='font-medium text-gray-600 transition-colors hover:text-blue-600'
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className='hidden items-center space-x-4 md:flex'>
            <Button variant='outline' size='sm'>
              <Phone className='mr-2 h-4 w-4' />
              Emergency
            </Button>
            {isAuthenticated ? (
              <div className='flex items-center space-x-2'>
                <span className='text-sm text-gray-600'>
                  Welcome, {user?.firstName}
                </span>
                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={handleBookAppointment}
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  Book Appointment
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate({ to: '/dashboard' })}
                >
                  <User className='mr-2 h-4 w-4' />
                  Dashboard
                </Button>
                <Button variant='outline' size='sm' onClick={handleLogout}>
                  <LogOut className='mr-2 h-4 w-4' />
                  Logout
                </Button>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Button
                  size='sm'
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={handleBookAppointment}
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  Book Appointment
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => navigate({ to: '/login' })}
                >
                  <User className='mr-2 h-4 w-4' />
                  Login
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className='p-2 md:hidden'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className='h-6 w-6 text-gray-600' />
            ) : (
              <Menu className='h-6 w-6 text-gray-600' />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='border-t py-4 md:hidden'>
            <div className='flex flex-col space-y-4'>
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className='font-medium text-gray-600 transition-colors hover:text-blue-600'
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className='flex flex-col space-y-2 border-t pt-4'>
                <Button variant='outline' size='sm' className='w-full'>
                  <Phone className='mr-2 h-4 w-4' />
                  Emergency
                </Button>
                {isAuthenticated ? (
                  <>
                    <div className='py-2 text-center text-sm text-gray-600'>
                      Welcome, {user?.firstName}
                    </div>
                    <Button
                      size='sm'
                      className='w-full bg-blue-600 hover:bg-blue-700'
                      onClick={handleBookAppointment}
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      Book Appointment
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => {
                        navigate({ to: '/dashboard' })
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className='mr-2 h-4 w-4' />
                      Dashboard
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={handleLogout}
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size='sm'
                      className='w-full bg-blue-600 hover:bg-blue-700'
                      onClick={handleBookAppointment}
                    >
                      <Calendar className='mr-2 h-4 w-4' />
                      Book Appointment
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full'
                      onClick={() => {
                        navigate({ to: '/login' })
                        setIsMenuOpen(false)
                      }}
                    >
                      <User className='mr-2 h-4 w-4' />
                      Login
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
