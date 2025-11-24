import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Eye, PencilLine, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useBills, useCreatePayment } from '@/api/hooks'
import {
  useDeleteAdmission,
  useUpdateAdmission,
} from '@/api/hooks/useAdmissions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import SearchableDropdown from '@/components/ui/searchable-dropdown'
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

  const { mutateAsync: deleteAdmissionById, isPending: isDeleting } =
    useDeleteAdmission()
  const { mutateAsync: updateAdmission, isPending: isUpdating } =
    useUpdateAdmission()
  const createPayment = useCreatePayment()

  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [payingBillId, setPayingBillId] = useState<string>('')
  const [payAmount, setPayAmount] = useState<number>(0)
  const { data: billsData } = useBills({
    page: 1,
    limit: 50,
    search: '',
    status: '',
    admissionId: (row.original as any).id,
  })

  const billOptions = useMemo(() => {
    const list = billsData?.data || []
    return list
      .map((bill: any) => {
        const paid = (bill.payments || []).reduce(
          (sum: number, p: any) =>
            sum +
            (typeof p.amount === 'number'
              ? p.amount
              : parseFloat(p.amount || 0)),
          0
        )
        const remaining = Math.max(0, (bill.totalAmount || 0) - paid)
        return {
          value: bill.id,
          label: `Bill #${bill.billNumber} - Due Rs ${remaining}`,
          remaining,
        }
      })
      .filter((b: any) => b.remaining > 0)
  }, [billsData])

  const handleDeleteClick = () => {
    setDeleteId(row.original.id)
    setIsDeleteModalOpen(true)
  }

  const handleEditClick = () => {
    navigate({
      to: `/dashboard/admissions/${row.original.id}/edit`,
    })
  }
  const handleDischargeClick = async () => {
    try {
      await updateAdmission({
        id: row.original.id,
        updatedAdmission: { status: 'DISCHARGED' },
      })
      toast.success('Discharge successful')
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Discharge failed'
      if (message.includes('Pending payment')) {
        setIsPayModalOpen(true)
      } else {
        toast.error(message)
      }
    }
  }

  const handlePayAndDischarge = async () => {
    if (!payingBillId || payAmount <= 0) return
    try {
      await createPayment.mutateAsync({
        billId: payingBillId,
        amount: payAmount,
        paymentMethod: 'CASH',
        transactionId: `ADM-DIS-${Date.now()}`,
      } as any)
      // retry discharge
      await handleDischargeClick()
      setIsPayModalOpen(false)
      setPayingBillId('')
      setPayAmount(0)
    } catch (err) {
      toast.error('Payment failed')
    }
  }
  const handleViewClick = () => {
    navigate({
      to: `/dashboard/admissions/${row.original.id}`,
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
      await deleteAdmissionById(deleteId)

      if (onDelete) {
        await onDelete(deleteId)
      }

      toast.success('Admission deleted successfully!')
      handleCloseDeleteModal()
    } catch (error) {
      toast.error('Error deleting admission')
      console.error('Error deleting admission:', error)
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
          onClick={handleDischargeClick}
          size='icon'
          variant='ghost'
          className='!h-7 !w-7 bg-amber-600 text-white hover:bg-amber-700 hover:text-white'
          disabled={isUpdating}
        >
          <LogOut size={16} />
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
        title='Delete admission'
        description='Are you sure you want to delete this admission? This action cannot be undone.'
      />

      <Dialog open={isPayModalOpen} onOpenChange={setIsPayModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pending payment detected</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <SearchableDropdown
              options={billOptions || []}
              placeholder='Select bill to pay'
              value={payingBillId}
              onSelect={(val) => setPayingBillId(String(val))}
            />
            <Input
              type='number'
              step='0.01'
              min='0'
              placeholder='Enter amount'
              value={payAmount}
              onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsPayModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePayAndDischarge}
              disabled={!payingBillId || payAmount <= 0}
            >
              Pay & Discharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
