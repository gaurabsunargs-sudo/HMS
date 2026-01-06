import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Row } from '@tanstack/react-table'
import { Eye, PencilLine, Trash2, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useBills, useCreatePayment } from '@/api/hooks'
import {
  useDeleteAdmission,
  useUpdateAdmission,
} from '@/api/hooks/useAdmissions'
import getUserRole from '@/lib/get-user-role'
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

  const userRole = getUserRole()
  const isPatient = userRole === 'patient'

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
          (sum: number, p: any) => sum + (Number(p.amount) || 0),
          0
        )
        // Exclude bed charges from bill total if it's a BED bill, as we double count otherwise
        // Actually, for simple paying, we just want to know how much is left on that specific bill record
        const remaining = Math.max(0, (bill.totalAmount || 0) - paid)
        const patientName = `${bill.patient?.user?.firstName || ''} ${bill.patient?.user?.lastName || ''}`
        return {
          value: bill.id,
          label: `Bill #${bill.billNumber} (${patientName}) - Rs ${remaining.toFixed(2)}`,
          remaining,
        }
      })
      .filter((b: any) => b.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining) // Show largest dues first
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
      const message = e?.response?.data?.message || ''
      if (message.includes('Pending payment')) {
        setIsPayModalOpen(true)
      }
    }
  }

  // Calculate consolidated values for the Quick Pay modal
  const consolidated = useMemo(() => {
    const admission = row.original as any
    const bills = admission.bills || []

    // 1. Calculate Total Paid
    const totalPaid = bills.reduce((sum: number, bill: any) => {
      const billPaid = (bill.payments || []).reduce(
        (s: number, p: any) => s + (Number(p.amount) || 0),
        0
      )
      return sum + billPaid
    }, 0)

    // 2. Calculate Grand Total
    const base = Number(admission.totalAmount || 0)
    const billsTotal = bills.reduce((sum: number, b: any) => {
      if (b.billNumber?.startsWith('BED-')) return sum
      return sum + Number(b.totalAmount || 0)
    }, 0)

    let bedCharge = 0
    if (admission.bed?.pricePerDay) {
      const pricePerDay = parseFloat(String(admission.bed.pricePerDay))
      const start = new Date(admission.admissionDate).getTime()
      const end = admission.dischargeDate
        ? new Date(admission.dischargeDate).getTime()
        : Date.now()
      const days = Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)))
      bedCharge = days * pricePerDay
    }

    const grandTotal = base + billsTotal + bedCharge
    const remaining = Math.max(0, grandTotal - totalPaid)

    return { totalPaid, grandTotal, remaining }
  }, [row.original, billsData])

  // Update payment fields when modal opens
  useEffect(() => {
    if (isPayModalOpen) {
      setPayAmount(Number(consolidated.remaining.toFixed(2)))
      if (billOptions.length > 0) {
        setPayingBillId(billOptions[0].value)
      }
    }
  }, [isPayModalOpen, consolidated.remaining, billOptions])

  const handlePayAndDischarge = async () => {
    if (!payingBillId || payAmount <= 0) {
      toast.error('Please select a bill and enter an amount')
      return
    }
    try {
      await createPayment.mutateAsync({
        billId: payingBillId,
        amount: payAmount,
        paymentMethod: 'CASH',
        transactionId: `ADM-DIS-${Date.now()}`,
        notes: 'Final payment before discharge',
      } as any)

      // retry discharge
      await handleDischargeClick()
      setIsPayModalOpen(false)
    } catch (err: any) {
      console.error('Payment failed:', err)
      toast.error(err?.response?.data?.message || 'Payment failed')
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

        {!isPatient && (
          <Button
            onClick={handleEditClick}
            size='icon'
            variant='ghost'
            className='!h-7 !w-7 bg-blue-800 text-white hover:bg-blue-900 hover:text-white'
          >
            <PencilLine size={16} />
          </Button>
        )}

        {!isPatient && (
          <Button
            onClick={handleDischargeClick}
            size='icon'
            variant='ghost'
            className='!h-7 !w-7 bg-amber-600 text-white hover:bg-amber-700 hover:text-white'
            disabled={isUpdating}
          >
            <LogOut size={16} />
          </Button>
        )}

        {!isPatient && (
          <Button
            onClick={handleDeleteClick}
            size='icon'
            variant='ghost'
            className='!h-7 !w-7 bg-red-600 text-white hover:bg-red-700 hover:text-white'
          >
            <Trash2 size={16} />
          </Button>
        )}
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
