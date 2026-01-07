import {
  selectPagePatients,
  selectRowsPatients,
} from '@/redux/slices/patientListSlice'
import { useAppSelector } from '@/redux/store'
import { Patient } from '@/schema/patients-schema'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPagePatients)
      const rows = useAppSelector(selectRowsPatients)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'patientId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Patient ID' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm font-medium'>
        {row?.original?.patientId || '-'}
      </div>
    ),
    enableHiding: true,
    initialHidden: true
  },

  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const firstName = row?.original?.user?.firstName || ''
      const middleName = row?.original?.user?.middleName || ''
      const lastName = row?.original?.user?.lastName || ''
      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(' ')
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {fullName || '-'}
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
      <div className='max-w-[200px] text-sm'>
        {row?.original?.user?.email || '-'}
      </div>
    ),
  },

  {
    accessorKey: 'contactNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contact' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] text-sm'>
        {row?.original?.contactNumber || '-'}
      </div>
    ),
  },

  {
    accessorKey: 'gender',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Gender' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[80px] text-sm capitalize'>
        {row?.original?.gender?.toLowerCase() || '-'}
      </div>
    ),
  },

  {
    accessorKey: 'bloodGroup',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Blood Group' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[80px] text-sm font-medium'>
        {row?.original?.bloodGroup || '-'}
      </div>
    ),
  },

  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row?.original?.user?.role
      return role ? (
        <span className='rounded-md border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs text-purple-700 capitalize'>
          {role.toLowerCase()}
        </span>
      ) : (
        <span className='text-gray-500'>-</span>
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
