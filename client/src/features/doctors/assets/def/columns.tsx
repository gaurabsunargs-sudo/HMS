import {
  selectPageDoctors,
  selectRowsDoctors,
} from '@/redux/slices/doctorListSlice'
import { useAppSelector } from '@/redux/store'
import { Doctor } from '@/schema/doctors-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const createColumns = (isAdmin: boolean): ColumnDef<Doctor>[] => {
  const baseColumns: ColumnDef<Doctor>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageDoctors)
      const rows = useAppSelector(selectRowsDoctors)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'licenseNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='License No.' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] text-sm font-medium'>
        {row.original.licenseNumber}
      </div>
    ),
  },

  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const firstName = row.original.user.firstName
      const middleName = row.original.user.middleName || ''
      const lastName = row.original.user.lastName || ''
      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(' ')
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {fullName}
        </div>
      )
    },
  },

  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px] text-sm'>{row.original.user.email}</div>
    ),
  },

  {
    accessorKey: 'specialization',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Specialization' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] text-sm'>{row.original.specialization}</div>
    ),
  },

  {
    accessorKey: 'experience',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Experience' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[80px] text-sm'>
        {row.original.experience} years
      </div>
    ),
  },

  {
    accessorKey: 'qualifications',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Qualifications' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[200px]'>
        {row.original.qualifications.map((qual, index) => (
          <Badge key={index} variant='secondary' className='mr-1 mb-1 text-xs'>
            {qual}
          </Badge>
        ))}
      </div>
    ),
  },

  {
    accessorKey: 'consultationFee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fee' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[80px] text-sm font-medium'>
        Rs. {row.original.consultationFee}
      </div>
    ),
  },

  {
    accessorKey: 'isAvailable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isAvailable = row.original.isAvailable
      return (
        <Badge
          variant={isAvailable ? 'default' : 'secondary'}
          className={
            isAvailable
              ? 'bg-green-100 text-green-800 hover:bg-green-100'
              : 'bg-red-100 text-red-800 hover:bg-red-100'
          }
        >
          {isAvailable ? 'Available' : 'Busy'}
        </Badge>
      )
    },
  },
  ]

  // Only add actions column if user is admin
  if (isAdmin) {
    baseColumns.push({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Action' />
      ),
      cell: ({ row }) => <DataTableRowActions row={row} />,
    })
  }

  return baseColumns
}
