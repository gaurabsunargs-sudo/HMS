import {
  selectPageAdmissions,
  selectRowsAdmissions,
} from '@/redux/slices/admissionListSlice'
import { useAppSelector } from '@/redux/store'
import { Admission } from '@/schema/admissions-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Admission>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageAdmissions)
      const rows = useAppSelector(selectRowsAdmissions)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
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
    accessorKey: 'bedInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bed' />
    ),
    cell: ({ row }) => {
      const bed = row.original.bed
      return (
        <div className='max-w-[120px] text-sm'>
          {bed ? (
            <div>
              <div className='font-medium'>{bed.bedNumber}</div>
              <div className='text-xs text-gray-500 capitalize'>
                {bed.bedType}
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
    accessorKey: 'ward',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ward' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] text-sm capitalize'>
        {row.original.bed?.ward || 'N/A'}
      </div>
    ),
  },

  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reason' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row.original.reason || 'No reason provided'}
      </div>
    ),
    initialHidden: true,
  },

  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Total' />
    ),
    cell: ({ row }) => {
      const admission = row.original as any
      const base = Number(admission.totalAmount || 0)
      const bills = (admission.bills || []) as any[]
      const billsTotal = bills.reduce(
        (sum: number, b: any) => sum + Number(b.totalAmount || 0),
        0
      )

      // Dynamic bed charge for current admissions (until now)
      let bedCharge = 0
      if (admission.status === 'ADMITTED' && admission.bed?.pricePerDay) {
        const pricePerDay = parseFloat(String(admission.bed.pricePerDay))
        const start = new Date(admission.admissionDate).getTime()
        const end = Date.now()
        const days = Math.max(
          1,
          Math.ceil((end - start) / (24 * 60 * 60 * 1000))
        )
        bedCharge = days * pricePerDay
      }

      const total = base + billsTotal + bedCharge

      return (
        <div className='max-w-[100px] text-sm font-medium'>
          Rs {total.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'paidAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Paid' />
    ),
    cell: ({ row }) => {
      const bills = (row.original as any).bills || []
      const paid = bills.reduce((sum: number, bill: any) => {
        const billPaid = (bill.payments || []).reduce(
          (s: number, p: any) =>
            s +
            (typeof p.amount === 'number'
              ? p.amount
              : parseFloat(p.amount || 0)),
          0
        )
        return sum + billPaid
      }, 0)
      return (
        <div className='max-w-[100px] text-sm font-medium'>
          Rs {paid.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'remainingAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Remaining' />
    ),
    cell: ({ row }) => {
      const admission = row.original as any
      const bills = admission.bills || []
      const paid = bills.reduce((sum: number, bill: any) => {
        const billPaid = (bill.payments || []).reduce(
          (s: number, p: any) =>
            s +
            (typeof p.amount === 'number'
              ? p.amount
              : parseFloat(p.amount || 0)),
          0
        )
        return sum + billPaid
      }, 0)
      const base = Number(admission.totalAmount || 0)
      const billsTotal = bills.reduce(
        (sum: number, b: any) => sum + Number(b.totalAmount || 0),
        0
      )
      let bedCharge = 0
      if (admission.status === 'ADMITTED' && admission.bed?.pricePerDay) {
        const pricePerDay = parseFloat(String(admission.bed.pricePerDay))
        const start = new Date(admission.admissionDate).getTime()
        const end = Date.now()
        const days = Math.max(
          1,
          Math.ceil((end - start) / (24 * 60 * 60 * 1000))
        )
        bedCharge = days * pricePerDay
      }
      const total = base + billsTotal + bedCharge
      const remaining = Math.max(0, total - paid)
      return (
        <div className='max-w-[100px] text-sm font-medium'>
          Rs {remaining.toFixed(2)}
        </div>
      )
    },
  },

  {
    accessorKey: 'admissionDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Admission Date' />
    ),
    cell: ({ row }) => {
      const admissionDate = new Date(row.original.admissionDate)
      const formattedDate = admissionDate.toLocaleDateString()
      const formattedTime = admissionDate.toLocaleTimeString([], {
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
    accessorKey: 'dischargeDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Discharge Date' />
    ),
    cell: ({ row }) => {
      if (!row.original.dischargeDate) {
        return (
          <div className='max-w-[120px] text-sm text-gray-400'>
            Not discharged
          </div>
        )
      }

      const dischargeDate = new Date(row.original.dischargeDate)
      const formattedDate = dischargeDate.toLocaleDateString()

      return <div className='max-w-[120px] text-sm'>{formattedDate}</div>
    },
    initialHidden: true,
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const statusConfig = {
        ADMITTED: {
          label: 'Admitted',
          variant: 'default',
          className: 'bg-blue-100 text-blue-800',
        },
        DISCHARGED: {
          label: 'Discharged',
          variant: 'default',
          className: 'bg-green-100 text-green-800',
        },
      }

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: 'outline',
        className: 'bg-gray-100 text-gray-800',
      }

      return (
        <Badge variant={config.variant as any} className={config.className}>
          {config.label}
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
