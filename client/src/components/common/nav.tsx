import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Activity, Menu, X } from 'lucide-react'
import { getUserData } from '@/lib/user-utils'
import { NavProfileDropdown } from '@/components/nav-profile-dropdown'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/ai-prediction', label: 'AI Disease Prediction' },
  { href: '/doctors', label: 'Doctors' },
  { href: '/services', label: 'Services' },
]

const Navigation = () => {
  const [open, setOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserData()
      setIsAuthenticated(!!userData)
    }

    checkAuth()

    // Listen for storage changes (when cookies are updated)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)

    // Also check on focus (when user comes back to tab)
    window.addEventListener('focus', checkAuth)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const isHomePage = true

  return (
    <header
      className={`fixed top-0 z-[5000000000] w-full transition-all duration-300 ${
        isHomePage
          ? isScrolled
            ? 'border-gray-200 bg-white/95 backdrop-blur-md'
            : 'border-white/20 bg-white/10 backdrop-blur-md'
          : 'border-gray-200 bg-white/95 backdrop-blur-md'
      }`}
    >
      <div className='container mx-auto flex items-center justify-between px-6 py-4'>
        {/* Logo */}
        <Link to='/' className='flex items-center space-x-2'>
          <Activity
            className={`h-8 w-8 transition-colors duration-300 ${
              isHomePage
                ? isScrolled
                  ? 'text-purple-600'
                  : 'text-white'
                : 'text-purple-600'
            }`}
          />

          <span
            className={`text-xl font-bold transition-colors duration-300 ${
              isHomePage
                ? isScrolled
                  ? 'text-gray-800'
                  : 'text-white'
                : 'text-gray-800'
            }`}
          >
            PulsePoint
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden items-center space-x-8 md:flex'>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`relative font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? isHomePage
                    ? isScrolled
                      ? 'text-purple-600'
                      : 'text-white'
                    : 'text-purple-600'
                  : isHomePage
                    ? isScrolled
                      ? 'text-gray-700 hover:scale-105 hover:text-purple-600'
                      : 'text-white/80 hover:scale-105 hover:text-white'
                    : 'text-gray-700 hover:scale-105 hover:text-purple-600'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <div
                  className={`absolute right-0 -bottom-1 left-0 h-0.5 rounded-full transition-colors duration-300 ${
                    isHomePage
                      ? isScrolled
                        ? 'bg-purple-600'
                        : 'bg-white'
                      : 'bg-purple-600'
                  }`}
                />
              )}
            </Link>
          ))}
          <div className='flex items-center space-x-4'>
            {isAuthenticated ? (
              <>
                <NavProfileDropdown
                  isHomePage={isHomePage}
                  isScrolled={isScrolled}
                />
              </>
            ) : (
              <>
                <Link
                  to='/sign-in'
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all hover:scale-105 ${
                    isHomePage
                      ? isScrolled
                        ? 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                        : 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                      : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Sign in
                </Link>
                <Link
                  to='/sign-up'
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium shadow-lg transition-all hover:scale-105 ${
                    isHomePage
                      ? isScrolled
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white text-gray-800 hover:bg-white/90'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`transition-colors duration-300 focus:outline-none md:hidden ${
            isHomePage
              ? isScrolled
                ? 'text-gray-700'
                : 'text-white'
              : 'text-gray-700'
          }`}
        >
          {open ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className={`animate-slideDown border-t shadow-lg backdrop-blur-md md:hidden ${
            isHomePage
              ? isScrolled
                ? 'border-gray-200 bg-white/95'
                : 'border-white/20 bg-white/10'
              : 'border-gray-200 bg-white/95'
          }`}
        >
          <nav className='flex flex-col space-y-4 p-4'>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-medium transition-all duration-300 ${
                  isActive(link.href)
                    ? isHomePage
                      ? isScrolled
                        ? 'rounded-lg bg-purple-50 px-3 py-2 text-purple-600'
                        : 'rounded-lg bg-white/20 px-3 py-2 text-white'
                      : 'rounded-lg bg-purple-50 px-3 py-2 text-purple-600'
                    : isHomePage
                      ? isScrolled
                        ? 'rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                        : 'rounded-lg px-3 py-2 text-white/80 hover:bg-white/20 hover:text-white'
                      : 'rounded-lg px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <div className='flex flex-col space-y-3'>
                <div className='flex justify-center'>
                  <NavProfileDropdown
                    isHomePage={isHomePage}
                    isScrolled={isScrolled}
                  />
                </div>
              </div>
            ) : (
              <>
                <Link
                  to='/sign-in'
                  className={`rounded-lg px-4 py-2 text-center transition-all ${
                    isHomePage
                      ? isScrolled
                        ? 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                        : 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
                      : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to='/sign-up'
                  className={`rounded-lg px-4 py-2 text-center shadow-lg transition-all ${
                    isHomePage
                      ? isScrolled
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-white text-gray-800 hover:bg-white/90'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  onClick={() => setOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navigation
