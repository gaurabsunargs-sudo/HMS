import { selectPageUsers, selectRowsUsers } from '@/redux/slices/userListSlice'
import { useAppSelector } from '@/redux/store'
import { User } from '@/schema/users-schema'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageUsers)
      const rows = useAppSelector(selectRowsUsers)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const firstName = row.original.firstName
      const middleName = row.original.middleName || ''
      const lastName = row.original.lastName || ''
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
      <div className='max-w-[200px] text-sm'>{row.original.email}</div>
    ),
  },

  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Role' />
    ),
    cell: ({ row }) => {
      const role = row.original.role
      return role ? (
        <span className='rounded-md border border-purple-300 bg-purple-100 px-2 py-0.5 text-xs text-purple-700'>
          {role}
        </span>
      ) : (
        <span className='text-gray-500 italic'>No role</span>
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
