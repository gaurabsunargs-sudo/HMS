'use client'

import { Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = 'Delete Confirmation',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
}: DeleteConfirmationProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='max-w-[400px]'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-red-600'>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex items-center gap-2'>
          <AlertDialogCancel disabled={isLoading} className='mt-0'>
            Cancel
          </AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
            Yes, Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
