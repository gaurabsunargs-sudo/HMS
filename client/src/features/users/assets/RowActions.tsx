// @ts-nocheck
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Eye, PencilLine, Trash2, Key } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteUser } from '@/api/hooks/useUsers'
import { Button } from '@/components/ui/button'
import { DeleteConfirmation } from '@/components/delete-conformation'
import { UpdatePasswordDialog } from './UpdatePasswordDialog'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete?: (id: string) => Promise<void>
}

export function DataTableRowActions<TData extends { id: string }>({
  row,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const navigate = useNavigate()

  const { mutateAsync: deleteUserById, isPending: isDeleting } = useDeleteUser()

  const handleDeleteClick = () => {
    setDeleteId(row.original.id)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = () => {
    navigate({
      to: `/dashboard/users/${row.original.id}/edit`,
    })
  }
  const handleViewClick = () => {
    navigate({
      to: `/dashboard/users/${row.original.id}`,
    })
  }

  const handlePasswordClick = () => {
    setIsPasswordModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteId(null)
    setIsDeleteModalOpen(false)
  }

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      setIsLoading(true)
      await deleteUserById(deleteId)

      if (onDelete) {
        await onDelete(deleteId)
      }

      toast.success('User deleted successfully!')
      handleCloseDeleteModal()
    } catch (error: any) {
      console.error('Error deleting user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='flex items-center gap-1'>
        <Button
          onClick={handleViewClick}
          size='icon'
          variant='ghost'
          className='!h-7 !w-7 bg-green-600 text-white hover:bg-green-700 hover:text-white'
        >
          <Eye size={16} />
        </Button>

        <Button
          onClick={handleEditClick}
          size='icon'
          variant='ghost'
          className='hidden !h-7 !w-7 bg-blue-800 text-white hover:bg-blue-900 hover:text-white'
        >
          <PencilLine size={16} />
        </Button>

        <Button
          onClick={handlePasswordClick}
          size='icon'
          variant='ghost'
          className='!h-7 !w-7 bg-orange-600 text-white hover:bg-orange-700 hover:text-white'
          title='Update Password'
        >
          <Key size={16} />
        </Button>

        <Button
          onClick={handleDeleteClick}
          size='icon'
          variant='ghost'
          className='!h-7 !w-7 bg-red-600 text-white hover:bg-red-700 hover:text-white'
        >
          <Trash2 size={16} />
        </Button>
      </div>

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting || isLoading}
        title='Delete user'
        description='Are you sure you want to delete this user? This action cannot be undone.'
      />

      <UpdatePasswordDialog
        isOpen={isPasswordModalOpen}
        onClose={handleClosePasswordModal}
        userId={row.original.id}
        userName={`${row.original.firstName} ${row.original.lastName}`}
      />
    </>
  )
}
