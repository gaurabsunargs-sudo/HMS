import {
  selectPagePayments,
  selectRowsPayments,
} from '@/redux/slices/paymentListSlice'
import { useAppSelector } from '@/redux/store'
import { Payment } from '@/schema/payments-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPagePayments)
      const rows = useAppSelector(selectRowsPayments)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'transactionId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Transaction ID' />
    ),
    cell: ({ row }) => {
      const latestPayment = (row.original as any).latestPayment
      const paymentCount = (row.original as any).paymentCount

      return (
        <div className='max-w-[120px] text-sm font-medium'>
          <div>{latestPayment?.transactionId || 'N/A'}</div>
          {paymentCount > 1 && (
            <div className='text-muted-foreground text-xs'>
              Latest of {paymentCount}
            </div>
          )}
        </div>
      )
    },
    initialHidden: true,
  },

  {
    accessorKey: 'patientName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient' />
    ),
    cell: ({ row }) => {
      const patient = row.original.bill?.patient
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
        {row.original.bill?.patient?.patientId || 'N/A'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'billNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bill Number' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm font-medium'>
        {row.original.bill?.billNumber || 'N/A'}
      </div>
    ),
  },

  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Paid Amount' />
    ),
    cell: ({ row }) => {
      const totalPaidAmount = (row.original as any).totalPaidAmount
      const paymentCount = (row.original as any).paymentCount

      return (
        <div className='max-w-[100px] text-sm font-medium'>
          <div>Rs {totalPaidAmount.toFixed(2)}</div>
          {paymentCount > 1 && (
            <div className='text-muted-foreground text-xs'>
              ({paymentCount} payments)
            </div>
          )}
        </div>
      )
    },
    initialHidden: true,
  },

  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total Amount' />
    ),
    cell: ({ row }) => {
      const bill = row.original.bill
      if (!bill) return <div className='max-w-[100px] text-sm'>N/A</div>

      // Calculate admission charges
      const admissionAmount = bill.admission?.totalAmount
        ? parseFloat(bill.admission.totalAmount)
        : 0

      // Calculate bed charges if admission exists
      let bedCharges = 0
      if (bill.admission && bill.admission.bed) {
        const pricePerDay = parseFloat(bill.admission.bed.pricePerDay) || 0
        const admissionDate = new Date(bill.admission.admissionDate)
        const dischargeDate = bill.admission.dischargeDate
          ? new Date(bill.admission.dischargeDate)
          : new Date() // Use current date if not discharged

        const daysDiff = Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
      }

      // Calculate medical services (bill items)
      const medicalServices =
        bill.billItems?.reduce((sum, item) => {
          return sum + (item.totalPrice || 0)
        }, 0) || 0

      // Get bill amount
      const billAmount = parseFloat(bill.totalAmount) || 0

      // Calculate comprehensive total
      const totalAmount =
        admissionAmount + bedCharges + medicalServices + billAmount

      return (
        <div className='max-w-[100px] text-sm font-medium'>
          Rs {totalAmount.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Paid Amount' />
    ),
    cell: ({ row }) => {
      const totalPaidAmount = (row.original as any).totalPaidAmount

      return (
        <div className='max-w-[100px] text-sm font-medium text-green-600'>
          Rs {totalPaidAmount.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'remainingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remaining Amount' />
    ),
    cell: ({ row }) => {
      const bill = row.original.bill
      if (!bill) return <div className='max-w-[100px] text-sm'>N/A</div>

      // Calculate admission charges
      const admissionAmount = bill.admission?.totalAmount
        ? parseFloat(bill.admission.totalAmount)
        : 0

      // Calculate bed charges if admission exists
      let bedCharges = 0
      if (bill.admission && bill.admission.bed) {
        const pricePerDay = parseFloat(bill.admission.bed.pricePerDay) || 0
        const admissionDate = new Date(bill.admission.admissionDate)
        const dischargeDate = bill.admission.dischargeDate
          ? new Date(bill.admission.dischargeDate)
          : new Date() // Use current date if not discharged

        const daysDiff = Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
      }

      // Calculate medical services (bill items)
      const medicalServices =
        bill.billItems?.reduce((sum, item) => {
          return sum + (item.totalPrice || 0)
        }, 0) || 0

      // Get bill amount
      const billAmount = parseFloat(bill.totalAmount) || 0

      // Calculate comprehensive total
      const totalAmount =
        admissionAmount + bedCharges + medicalServices + billAmount

      const totalPaidAmount = (row.original as any).totalPaidAmount
      const remainingAmount = Math.max(0, totalAmount - totalPaidAmount)

      return (
        <div
          className={`max-w-[100px] text-sm font-medium ${remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}
        >
          Rs {remainingAmount.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Method' />
    ),
    cell: ({ row }) => {
      const latestPayment = (row.original as any).latestPayment
      const paymentMethod = latestPayment?.paymentMethod
      const methodConfig = {
        CASH: {
          label: 'Cash',
          variant: 'outline' as const,
          className: 'bg-green-100 text-green-800',
        },
        BANK: {
          label: 'Bank Transfer',
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800',
        },
      }

      const config = methodConfig[
        paymentMethod as keyof typeof methodConfig
      ] || {
        label: paymentMethod,
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
    accessorKey: 'receivedBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Received By' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] text-sm'>
        {(row.original as any).latestPayment?.receivedBy || 'N/A'}
      </div>
    ),
  },

  {
    accessorKey: 'receiptNo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Receipt No' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm'>
        {(row.original as any).latestPayment?.receiptNo || 'N/A'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'bankName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bank Name' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] text-sm'>
        {(row.original as any).latestPayment?.bankName || 'N/A'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Payment Date' />
    ),
    cell: ({ row }) => {
      const latestPayment = (row.original as any).latestPayment
      if (!latestPayment?.paymentDate) {
        return (
          <div className='max-w-[120px] text-sm text-gray-400'>No date</div>
        )
      }

      const paymentDate = new Date(latestPayment.paymentDate)
      const formattedDate = paymentDate.toLocaleDateString()
      const formattedTime = paymentDate.toLocaleTimeString([], {
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ row }) => {
      const latestPayment = (row.original as any).latestPayment
      const createdAt = new Date(latestPayment.createdAt)
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
    initialHidden: true,
  },

  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Notes' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm'>
        {(row.original as any).latestPayment?.notes || 'No notes'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'billStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bill Status' />
    ),
    cell: ({ row }) => {
      const bill = row.original.bill
      if (!bill) {
        return (
          <Badge variant='outline' className='bg-gray-100 text-gray-800'>
            Unknown
          </Badge>
        )
      }

      // Calculate admission charges
      const admissionAmount = bill.admission?.totalAmount
        ? parseFloat(bill.admission.totalAmount)
        : 0

      // Calculate bed charges if admission exists
      let bedCharges = 0
      if (bill.admission && bill.admission.bed) {
        const pricePerDay = parseFloat(bill.admission.bed.pricePerDay) || 0
        const admissionDate = new Date(bill.admission.admissionDate)
        const dischargeDate = bill.admission.dischargeDate
          ? new Date(bill.admission.dischargeDate)
          : new Date() // Use current date if not discharged

        const daysDiff = Math.ceil(
          (dischargeDate.getTime() - admissionDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
        bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
      }

      // Calculate medical services (bill items)
      const medicalServices =
        bill.billItems?.reduce((sum, item) => {
          return sum + (item.totalPrice || 0)
        }, 0) || 0

      // Get bill amount
      const billAmount = parseFloat(bill.totalAmount) || 0

      // Calculate comprehensive total
      const totalAmount =
        admissionAmount + bedCharges + medicalServices + billAmount

      const totalPaid = ((bill as any).payments || []).reduce(
        (sum: number, p: any) =>
          sum +
          (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0)),
        0
      )

      const remainingAmount = Math.max(0, totalAmount - totalPaid)

      // Determine status based on remaining amount
      let status: string
      let statusConfig: any

      if (remainingAmount === 0) {
        status = 'PAID'
        statusConfig = {
          label: 'Paid',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800',
        }
      } else if (totalPaid === 0) {
        status = 'PENDING'
        statusConfig = {
          label: 'Pending',
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800',
        }
      } else {
        status = 'REMAINING'
        statusConfig = {
          label: 'Remaining',
          variant: 'outline' as const,
          className: 'bg-orange-100 text-orange-800',
        }
      }

      return (
        <Badge
          variant={statusConfig.variant}
          className={statusConfig.className}
        >
          {statusConfig.label}
        </Badge>
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
