import { selectPageBeds, selectRowsBeds } from '@/redux/slices/bedListSlice'
import { useAppSelector } from '@/redux/store'
import { Bed } from '@/schema/beds-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<Bed>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageBeds)
      const rows = useAppSelector(selectRowsBeds)
      const serialNumber = (page - 1) * rows + row.index + 1
      return <div className='max-w-[20px] pl-2 text-sm'>{serialNumber}</div>
    },
  },

  {
    accessorKey: 'bedNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bed Number' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm font-medium'>
        {row.original.bedNumber}
      </div>
    ),
  },

  {
    accessorKey: 'bedType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Bed Type' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[120px] text-sm capitalize'>
        {row.original.bedType}
      </div>
    ),
  },

  {
    accessorKey: 'ward',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ward' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[150px] text-sm'>{row.original.ward}</div>
    ),
  },

  {
    accessorKey: 'isOccupied',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const isOccupied = row.original.isOccupied
      const statusConfig = {
        true: {
          label: 'Occupied',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800',
        },
        false: {
          label: 'Available',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800',
        },
      }

      const config =
        statusConfig[String(isOccupied) as keyof typeof statusConfig]

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      )
    },
  },

  {
    accessorKey: 'pricePerDay',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Price/Day' />
    ),
    cell: ({ row }) => (
      <div className='max-w-[100px] text-sm font-medium'>
        ${row.original.pricePerDay}
      </div>
    ),
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
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Action' />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
