import {
  selectPageAppointments,
  selectRowsAppointments,
} from '@/redux/slices/appointmentListSlice'
import { useAppSelector } from '@/redux/store'
import { Appointment } from '@/schema/appointments-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageAppointments)
      const rows = useAppSelector(selectRowsAppointments)
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
      const firstName = row.original.patient.user.firstName
      const lastName = row.original.patient.user.lastName || ''
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {fullName}
        </div>
      )
    },
  },

  {
    accessorKey: 'doctorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Doctor' />
    ),
    cell: ({ row }) => {
      const firstName = row.original.doctor.user.firstName
      const lastName = row.original.doctor.user.lastName || ''
      const fullName = [firstName, lastName].filter(Boolean).join(' ')
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          Dr. {fullName}
        </div>
      )
    },
  },

  {
    accessorKey: 'specialization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Specialization' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] text-sm'>
        {row.original.doctor.specialization}
      </div>
    ),
  },

  {
    accessorKey: 'dateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Date & Time' />
    ),
    cell: ({ row }) => {
      const dateTime = new Date(row.original.dateTime)
      const formattedDate = dateTime.toLocaleDateString()
      const formattedTime = dateTime.toLocaleTimeString([], {
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
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Duration' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[80px] text-sm'>{row.original.duration} mins</div>
    ),
  },

  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Reason' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row.original.reason}
      </div>
    ),
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status

      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default'
      let className = ''

      switch (status) {
        case 'PENDING':
          variant = 'secondary'
          className = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
          break
        case 'SCHEDULED':
          variant = 'default'
          className = 'bg-blue-100 text-blue-800 hover:bg-blue-100'
          break
        case 'COMPLETED':
          variant = 'default'
          className = 'bg-green-100 text-green-800 hover:bg-green-100'
          break
        case 'CANCELLED':
        case 'REJECTED':
          variant = 'destructive'
          className = 'bg-red-100 text-red-800 hover:bg-red-100'
          break
        case 'NO_SHOW':
          variant = 'secondary'
          className = 'bg-orange-100 text-orange-800 hover:bg-orange-100'
          break
        default:
          variant = 'secondary'
          className = 'bg-gray-100 text-gray-800 hover:bg-gray-100'
      }

      return (
        <Badge variant={variant} className={className}>
          {status === "SCHEDULED" ? "APPROVED" : status}
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
