import Cookies from 'js-cookie'
import { Link } from '@tanstack/react-router'
import { User, CreditCard, Users, LogOut } from 'lucide-react'
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

export function ProfileDropdown() {
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

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-10 w-10 rounded-full'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={getProfileImageUrl(userData?.profile) || '/avatars/01.png'}
              alt={userData?.username || 'User'}
            />
            <AvatarFallback className='bg-primary text-primary-foreground font-medium'>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium'>
              {userData?.firstName} {userData?.lastName}
            </p>
            <p className='text-muted-foreground text-xs'>
              {userData?.email || 'No email provided'}
            </p>
            <p className='text-muted-foreground text-xs capitalize'>
              Role: {userData?.role?.toLowerCase() || 'user'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={getProfileLink()} className='flex items-center gap-2'>
              <User className='h-4 w-4' />
              Profile
            </Link>
          </DropdownMenuItem>
          {userData?.role !== 'DOCTOR' && (
            <DropdownMenuItem asChild>
              <Link to={getBillingLink()} className='flex items-center gap-2'>
                <CreditCard className='h-4 w-4' />
                {userData?.role === 'PATIENT' ? 'Payments' : 'Billing'}
              </Link>
            </DropdownMenuItem>
          )}
          {userData?.role === 'ADMIN' && (
            <DropdownMenuItem asChild>
              <Link to='/dashboard/users' className='flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Users
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className='flex cursor-pointer items-center gap-2'
        >
          <LogOut className='h-4 w-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
