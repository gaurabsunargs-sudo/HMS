import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Eye, PencilLine, Settings2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useDeleteAppointment,
  useUpdateAppointment,
} from '@/api/hooks/useAppointments'
import getUserRole from '@/lib/get-user-role'
import { Button } from '@/components/ui/button'
import { DeleteConfirmation } from '@/components/delete-conformation'
import { StatusUpdateModal } from './StatusUpdateModal'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onDelete?: (id: string) => Promise<void>
}

export function DataTableRowActions<
  TData extends { id: string; status: string; dateTime: string },
>({ row, onDelete }: DataTableRowActionsProps<TData>) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const navigate = useNavigate()

  const userRole = getUserRole()
  const isPatient = userRole === 'patient'

  const { mutateAsync: deleteAppointmentById, isPending: isDeleting } =
    useDeleteAppointment()
  const { mutateAsync: updateAppointmentStatus } = useUpdateAppointment()

  const handleDeleteClick = () => {
    setDeleteId(row.original.id)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = () => {
    navigate({
      to: `/dashboard/appointments/${row.original.id}/edit`,
    })
  }

  const handleViewClick = () => {
    navigate({
      to: `/dashboard/appointments/${row.original.id}`,
    })
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      setIsUpdatingStatus(true)
      await updateAppointmentStatus({
        id: row.original.id,
        updatedAppointment: { status: status as any },
      })
      toast.success(`Status updated to ${status}`)
      setIsStatusModalOpen(false)
    } catch (error: any) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleStatusButtonClick = () => {
    const isPast = new Date(row.original.dateTime) < new Date()
    if (isPast) {
      toast.error('Time exceeded. Cannot update past appointments.')
      return
    }
    setIsStatusModalOpen(true)
  }

  const handleCloseDeleteModal = () => {
    setDeleteId(null)
    setIsDeleteModalOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    try {
      setIsLoading(true)
      await deleteAppointmentById(deleteId)

      if (onDelete) {
        await onDelete(deleteId)
      }

      toast.success('Appointment deleted successfully!')
      handleCloseDeleteModal()
    } catch (error) {
      console.error('Error deleting appointment:', error)
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
          title='View'
        >
          <Eye size={16} />
        </Button>

        {!isPatient && (
          <Button
            onClick={handleStatusButtonClick}
            size='icon'
            variant='ghost'
            className='!h-7 !w-7 bg-amber-500 text-white hover:bg-amber-600 hover:text-white'
            title='Change Status'
          >
            <Settings2 size={16} />
          </Button>
        )}

        {!isPatient && (
          <Button
            onClick={handleEditClick}
            size='icon'
            variant='ghost'
            className='!h-7 !w-7 bg-blue-800 text-white hover:bg-blue-900 hover:text-white'
            title='Edit'
          >
            <PencilLine size={16} />
          </Button>
        )}

        {!isPatient && (
          <Button
            onClick={handleDeleteClick}
            size='icon'
            variant='ghost'
            className='!h-7 hidden !w-7 bg-red-600 text-white hover:bg-red-700 hover:text-white'
            title='Delete'
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleStatusUpdate}
        currentStatus={row.original.status}
        isLoading={isUpdatingStatus}
      />

      <DeleteConfirmation
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting || isLoading}
        title='Delete appointment'
        description='Are you sure you want to delete this appointment? This action cannot be undone.'
      />
    </>
  )
}
