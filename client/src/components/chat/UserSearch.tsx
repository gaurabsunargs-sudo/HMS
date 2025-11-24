import React, { useState, useEffect } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSearchUsers, User } from '../../api/hooks/useMessaging'

interface UserSearchProps {
  onUserSelect: (user: User) => void
}

export const UserSearch: React.FC<UserSearchProps> = ({ onUserSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const {
    data: searchResults = [],
    isLoading,
    error,
  } = useSearchUsers(debouncedQuery)

  const handleUserSelect = (user: User) => {
    onUserSelect(user)
    setIsOpen(false)
    setSearchQuery('')
    setDebouncedQuery('')
  }

  const getUserInitials = (user: User) => {
    return `${user.first_name[0] || ''}${user.last_name[0] || ''}`.toUpperCase()
  }

  const getUserDisplayName = (user: User) => {
    return `${user.first_name} ${user.last_name}`.trim() || user.username
  }

  const renderUserItem = (user: User) => {
    return (
      <div
        key={user.id}
        className='flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50'
        onClick={() => handleUserSelect(user)}
      >
        <div className='relative'>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={user.profile_picture_url}
              alt={getUserDisplayName(user)}
            />
            <AvatarFallback className='bg-primary/10 text-primary font-medium'>
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          {user.role === 'doctor' && (
            <div className='absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs text-white'>
              Dr
            </div>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between'>
            <h4 className='truncate text-sm font-medium'>
              {getUserDisplayName(user)}
            </h4>
            <Badge variant='outline' className='text-xs'>
              {user.role}
            </Badge>
          </div>

          <div className='mt-1 flex items-center justify-between'>
            <p className='text-xs text-gray-600'>@{user.username}</p>
            {user.email && (
              <p className='truncate text-xs text-gray-500'>{user.email}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='w-full'>
          <UserPlus className='mr-2 h-4 w-4' />
          Start New Chat
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Search className='h-5 w-5' />
            Search Users
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
            <Input
              placeholder='Search by username, name, or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
              autoFocus
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='sm'
                className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0'
                onClick={() => {
                  setSearchQuery('')
                  setDebouncedQuery('')
                }}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <div className='max-h-[400px] min-h-[200px]'>
            {!searchQuery.trim() ? (
              <div className='py-8 text-center text-gray-500'>
                <Search className='mx-auto mb-3 h-12 w-12 text-gray-300' />
                <p>Type to search for users</p>
                <p className='mt-1 text-xs'>
                  Search by username, name, or email
                </p>
              </div>
            ) : isLoading ? (
              <div className='py-8 text-center text-gray-500'>
                <div className='border-primary mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-b-2'></div>
                <p>Searching users...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <ScrollArea className='h-full'>
                <div className='space-y-1'>
                  {searchResults.map(renderUserItem)}
                </div>
              </ScrollArea>
            ) : (
              <div className='py-8 text-center text-gray-500'>
                <UserPlus className='mx-auto mb-3 h-12 w-12 text-gray-300' />
                <p>No users found</p>
                <p className='mt-1 text-xs'>Try a different search term</p>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className='rounded-lg bg-gray-50 p-3 text-xs text-gray-500'>
            <p className='mb-1 font-medium'>Search Tips:</p>
            <ul className='space-y-1'>
              <li>• Search by username (e.g., "john123")</li>
              <li>• Search by name (e.g., "John Doe")</li>
              <li>• Search by email (e.g., "john@example.com")</li>
              <li>• Results are filtered based on your role permissions</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
