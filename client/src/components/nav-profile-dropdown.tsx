import Cookies from 'js-cookie'
import { Link } from '@tanstack/react-router'
import { User, CreditCard, Users, LogOut, LayoutDashboard } from 'lucide-react'
import { getProfileImageUrl } from '@/lib/image-utils'
import { getUserData } from '@/lib/user-utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavProfileDropdownProps {
  isHomePage?: boolean
  isScrolled?: boolean
}

export function NavProfileDropdown({
  isHomePage = false,
  isScrolled = false,
}: NavProfileDropdownProps) {
  const logout = () => {
    Cookies.remove('hms-user')
    Cookies.remove('hms-token')
    window.location.reload()
  }

  const userData = getUserData()

  // Generate user initials for fallback avatar
  const getUserInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`
    }
    return 'U'
  }

  // Get appropriate links based on user role
  const getProfileLink = () => {
    return '/dashboard/profile'
  }

  const getBillingLink = () => {
    if (userData?.role === 'ADMIN') {
      return '/dashboard/bills'
    }
    if (userData?.role === 'PATIENT') {
      return '/dashboard/payments'
    }
    return '/dashboard/bills'
  }

  const getDashboardLink = () => {
    return '/dashboard'
  }

  // Dynamic styling based on navigation state
  const getTriggerStyles = () => {
    if (isHomePage && !isScrolled) {
      return 'border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20'
    }
    return 'border border-purple-600 text-purple-600 hover:bg-purple-50'
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className={`relative h-10 w-10 rounded-full transition-all duration-300 hover:scale-105 ${getTriggerStyles()}`}
        >
          <Avatar className='h-8 w-8'>
            <AvatarImage
              src={getProfileImageUrl(userData?.profile) || '/avatars/01.png'}
              alt={userData?.username || 'User'}
            />
            <AvatarFallback
              className={`text-xs font-medium ${
                isHomePage && !isScrolled
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-100 text-purple-600'
              }`}
            >
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='z-[500000000000000000000000000000] w-64'
        align='end'
        forceMount
      >
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm leading-none font-medium'>
              {userData?.firstName} {userData?.lastName}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {userData?.email || 'No email provided'}
            </p>
            <p className='text-muted-foreground text-xs leading-none capitalize'>
              {userData?.role?.toLowerCase() || 'user'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              to={getDashboardLink()}
              className='flex cursor-pointer items-center gap-3'
            >
              <LayoutDashboard className='h-4 w-4' />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to={getProfileLink()}
              className='flex cursor-pointer items-center gap-3'
            >
              <User className='h-4 w-4' />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              to={getBillingLink()}
              className='flex cursor-pointer items-center gap-3'
            >
              <CreditCard className='h-4 w-4' />
              <span>
                {userData?.role === 'PATIENT' ? 'Payments' : 'Billing'}
              </span>
            </Link>
          </DropdownMenuItem>
          {userData?.role === 'ADMIN' && (
            <DropdownMenuItem asChild>
              <Link
                to='/dashboard/users'
                className='flex cursor-pointer items-center gap-3'
              >
                <Users className='h-4 w-4' />
                <span>Users</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className='flex cursor-pointer items-center gap-3 text-red-600 focus:text-red-600'
        >
          <LogOut className='h-4 w-4' />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
