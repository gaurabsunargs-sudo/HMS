import React, { useRef, useState } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useProfileUpload } from '@/api/hooks/useProfileUpload'
import { getProfileImageUrl } from '@/lib/image-utils'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface ProfileUploadProps {
  currentProfile?: string
  userName: string
  className?: string
}

export const ProfileUpload: React.FC<ProfileUploadProps> = ({
  currentProfile,
  userName,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { mutate: uploadProfile, isPending } = useProfileUpload()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive',
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleUpload = () => {
    if (!selectedFile) return

    uploadProfile(selectedFile, {
      onSuccess: (data) => {
        toast({
          title: 'Success',
          description: 'Profile picture updated successfully',
        })
        // Clear preview and selected file
        setPreviewUrl(null)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
      onError: (error) => {
        toast({
          title: 'Upload failed',
          description: error.message || 'Failed to upload profile picture',
          variant: 'destructive',
        })
      },
    })
  }

  const handleCancel = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getInitials = () => {
    const names = userName.split(' ')
    return names
      .map((name) => name.charAt(0))
      .join('')
      .toUpperCase()
  }

  const displayImage = previewUrl || getProfileImageUrl(currentProfile)

  return (
    <div className={cn('flex flex-col items-center space-y-4', className)}>
      <div className='relative'>
        <Avatar className='border-primary/10 h-24 w-24 border-4'>
          <AvatarImage src={displayImage || ''} alt={userName} />
          <AvatarFallback className='text-2xl font-semibold'>
            {getInitials()}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        <Button
          size='sm'
          variant='secondary'
          className='absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-0'
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Camera className='h-4 w-4' />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileSelect}
        className='hidden'
      />

      {selectedFile && (
        <div className='flex flex-col items-center space-y-2'>
          <p className='text-muted-foreground text-sm'>
            Selected: {selectedFile.name}
          </p>
          <div className='flex space-x-2'>
            <Button size='sm' onClick={handleUpload} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload
                </>
              )}
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={handleCancel}
              disabled={isPending}
            >
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!selectedFile && (
        <Button
          variant='outline'
          size='sm'
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
        >
          <Upload className='mr-2 h-4 w-4' />
          Change Photo
        </Button>
      )}
    </div>
  )
}
