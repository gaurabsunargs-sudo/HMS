import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Eye, PencilLine, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDeletePatient } from '@/api/hooks/usePatients'
import { Button } from '@/components/ui/button'
import { DeleteConfirmation } from '@/components/delete-conformation'

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
  const navigate = useNavigate()

  const { mutateAsync: deletePatientById, isPending: isDeleting } =
    useDeletePatient()

  const handleDeleteClick = () => {
    setDeleteId(row.original.id)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = () => {
    navigate({
      to: `/dashboard/patients/${row.original.id}/edit`,
    })
  }
  const handleViewClick = () => {
    navigate({
      to: `/dashboard/patients/${row.original.id}`,
    })
  }

  const handleCloseDeleteModal = () => {
    setDeleteId(null)
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      setIsLoading(true)
      await deletePatientById(deleteId)

      if (onDelete) {
        await onDelete(deleteId)
      }

      toast.success('Patient deleted successfully!')
      handleCloseDeleteModal()
    } catch (error) {
      toast.error('Error deleting patient')
      console.error('Error deleting patient:', error)
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
          className='!h-7 !w-7 bg-blue-800 text-white hover:bg-blue-900 hover:text-white'
        >
          <PencilLine size={16} />
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
        title='Delete patient'
        description='Are you sure you want to delete this patient? This action cannot be undone.'
      />
    </>
  )
}
