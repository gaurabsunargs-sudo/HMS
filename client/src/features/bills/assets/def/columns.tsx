import { selectPageBills, selectRowsBills } from '@/redux/slices/billListSlice'
import { useAppSelector } from '@/redux/store'
import { Bill } from '@/schema/bills-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Bill>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageBills)
      const rows = useAppSelector(selectRowsBills)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'billNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bill Number' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm font-medium'>
        {row.original.billNumber}
      </div>
    ),
  },

  {
    accessorKey: 'patientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient' />
    ),
    cell: ({ row }) => {
      const patient = row.original.patient
      const firstName = patient?.user?.firstName || ''
      const lastName = patient?.user?.lastName || ''
      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Patient'

      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {fullName}
        </div>
      )
    },
  },

  {
    accessorKey: 'patientId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient ID' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm'>
        {row.original.patient?.patientId || 'N/A'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'admissionInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Admission' />
    ),
    cell: ({ row }) => {
      const admission = row.original.admission
      return (
        <div className='max-w-[120px] text-sm'>
          {admission ? (
            <div>
              <div className='font-medium capitalize'>{admission.status}</div>
              <div className='text-xs text-gray-500'>
                {new Date(admission.admissionDate).toLocaleDateString()}
              </div>
            </div>
          ) : (
            'N/A'
          )}
        </div>
      )
    },
  },

  {
    accessorKey: 'dueDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Due Date' />
    ),
    cell: ({ row }) => {
      if (!row.original.dueDate) {
        return (
          <div className='max-w-[120px] text-sm text-gray-400'>No due date</div>
        )
      }

      const dueDate = new Date(row.original.dueDate)
      const formattedDate = dueDate.toLocaleDateString()

      return <div className='max-w-[120px] text-sm'>{formattedDate}</div>
    },
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const createdAt = new Date(row.original.createdAt)
      const formattedDate = createdAt.toLocaleDateString()
      const formattedTime = createdAt.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      return (
        <div className='max-w-[150px] text-sm'>
          <div>{formattedDate}</div>
          <div className='text-xs text-gray-500'>{formattedTime}</div>
        </div>
      )
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const statusConfig = {
        PAID: {
          label: 'Paid',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800',
        },
        PENDING: {
          label: 'Pending',
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800',
        },
        OVERDUE: {
          label: 'Overdue',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800',
        },
        CANCELLED: {
          label: 'Cancelled',
          variant: 'destructive' as const,
          className: 'bg-gray-100 text-gray-800',
        },
        PARTIAL: {
          label: 'Partial',
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800',
        },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800',
      }

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      )
    },
  },

  {
    accessorKey: 'paymentDetails',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Details' />
    ),
    cell: ({ row }) => {
      // Calculate admission charges
      const admissionAmount = row.original.admission?.totalAmount
        ? parseFloat(row.original.admission.totalAmount)
        : 0

      // Calculate bed charges if admission exists
      let bedCharges = 0
      if (row.original.admission && row.original.admission.bed) {
        const pricePerDay =
          parseFloat(row.original.admission.bed.pricePerDay) || 0
        const admissionDate = new Date(row.original.admission.admissionDate)
        const dischargeDate = row.original.admission.dischargeDate
          ? new Date(row.original.admission.dischargeDate)
          : new Date() // Use current date if not discharged

        const daysDiff = Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
      }

      // Calculate medical services (bill items)
      const medicalServices =
        row.original.billItems?.reduce((sum, item) => {
          return sum + (item.totalPrice || 0)
        }, 0) || 0

      // Get bill amount
      const billAmount = parseFloat(row.original.totalAmount) || 0

      // Calculate comprehensive total
      const totalAmount =
        admissionAmount + bedCharges + medicalServices + billAmount

      const payments = row.original.payments || []
      const totalPaid = payments.reduce((sum, payment) => {
        return sum + (parseFloat(payment.amount) || 0)
      }, 0)
      const remaining = totalAmount - totalPaid

      return (
        <div className='max-w-[140px] text-sm'>
          <div className='font-medium'>Total: Rs. {totalAmount.toFixed(0)}</div>
          <div className='text-green-600'>Paid: Rs. {totalPaid.toFixed(0)}</div>
          <div
            className={`${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            Balance: Rs. {remaining.toFixed(0)}
          </div>
        </div>
      )
    },
  },

  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
