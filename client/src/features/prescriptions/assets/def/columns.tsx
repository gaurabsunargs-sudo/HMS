import {
  selectPagePrescriptions,
  selectRowsPrescriptions,
} from '@/redux/slices/prescriptionListSlice'
import { useAppSelector } from '@/redux/store'
import { Prescription } from '@/schema/prescriptions-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Prescription>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPagePrescriptions)
      const rows = useAppSelector(selectRowsPrescriptions)
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
    accessorKey: 'doctorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Doctor' />
    ),
    cell: ({ row }) => {
      const doctor = row.original.doctor
      const firstName = doctor?.user?.firstName || ''
      const lastName = doctor?.user?.lastName || ''
      const fullName =
        firstName && lastName
          ? `Dr. ${firstName} ${lastName}`
          : 'Unknown Doctor'

      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {fullName}
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
      <div className='max-w-[150px] text-sm capitalize'>
        {row.original.doctor?.specialization || 'N/A'}
      </div>
    ),
  },

  {
    accessorKey: 'medicines',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Medicines' />
    ),
    cell: ({ row }) => {
      const medicines = row.original.medicines || []
      return (
        <div className='max-w-[200px] text-sm'>
          {medicines.length > 0 ? (
            <div className='space-y-1'>
              {medicines.slice(0, 2).map((medicine, index) => (
                <Badge
                  key={index}
                  variant='secondary'
                  className='mr-1 bg-green-100 text-green-800'
                >
                  {medicine.name}
                </Badge>
              ))}
              {medicines.length > 2 && (
                <Badge variant='outline' className='bg-gray-100 text-gray-600'>
                  +{medicines.length - 2} more
                </Badge>
              )}
            </div>
          ) : (
            <span className='text-gray-400'>No medicines</span>
          )}
        </div>
      )
    },
  },

  {
    accessorKey: 'instructions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Instructions' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row.original.instructions || 'No instructions'}
      </div>
    ),
  },

  {
    accessorKey: 'issuedDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Issued Date' />
    ),
    cell: ({ row }) => {
      const issuedDate = new Date(row.original.issuedDate)
      const formattedDate = issuedDate.toLocaleDateString()
      const formattedTime = issuedDate.toLocaleTimeString([], {
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
    accessorKey: 'validUntil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Valid Until' />
    ),
    cell: ({ row }) => {
      const validUntil = new Date(row.original.validUntil)
      const formattedDate = validUntil.toLocaleDateString()

      // Check if prescription is still valid
      const isExpired = new Date() > validUntil

      return (
        <div className='max-w-[120px] text-sm'>
          <div className={isExpired ? 'text-red-600' : 'text-green-600'}>
            {formattedDate}
          </div>
          {isExpired && <div className='text-xs text-red-500'>Expired</div>}
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
      const validUntil = new Date(row.original.validUntil)
      const isExpired = new Date() > validUntil

      return (
        <Badge
          variant={isExpired ? 'destructive' : 'default'}
          className={
            isExpired
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }
        >
          {isExpired ? 'Expired' : 'Active'}
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
