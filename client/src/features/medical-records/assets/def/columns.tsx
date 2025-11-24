import {
  selectPageMedicalRecords,
  selectRowsMedicalRecords,
} from '@/redux/slices/medicalRecordListSlice'
import { useAppSelector } from '@/redux/store'
import { MedicalRecord } from '@/schema/medical-records-schema'
import { Badge } from '@/components/ui/badge'
import type { ColumnDef } from '@/components/table/ColumnDef'
import { DataTableColumnHeader } from '@/components/table/ColumnHeader'
import { DataTableRowActions } from '../RowActions'

export const columns: ColumnDef<MedicalRecord>[] = [
  {
    accessorKey: 'sn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='S.N' />
    ),
    cell: ({ row }) => {
      const page = useAppSelector(selectPageMedicalRecords)
      const rows = useAppSelector(selectRowsMedicalRecords)
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
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          {row?.original?.patient?.user?.firstName}
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
      return (
        <div className='line-clamp-1 max-w-[150px] text-sm font-medium'>
          Dr. {row?.original?.doctor?.user?.firstName}
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
        {row?.original?.doctor?.specialization}
      </div>
    ),
  },

  {
    accessorKey: 'symptoms',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Symptoms' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row?.original?.symptoms}
      </div>
    ),
  },

  {
    accessorKey: 'diagnosis',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Diagnosis' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row?.original?.diagnosis}
      </div>
    ),
  },

  {
    accessorKey: 'treatment',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Treatment' />
    ),
    cell: ({ row }) => (
      <div className='line-clamp-2 max-w-[200px] text-sm'>
        {row?.original?.treatment}
      </div>
    ),
  },

  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Created Date' />
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
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Updated Date' />
    ),
    cell: ({ row }) => {
      const updatedAt = new Date(row.original.updatedAt)
      const formattedDate = updatedAt.toLocaleDateString()
      const formattedTime = updatedAt.toLocaleTimeString([], {
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
    accessorKey: 'attachments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Attachments' />
    ),
    cell: ({ row }) => {
      const attachments = row.original.attachments || []
      return (
        <div className='max-w-[100px] text-sm'>
          {attachments.length > 0 ? (
            <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
              {attachments.length} file(s)
            </Badge>
          ) : (
            <span className='text-gray-400'>None</span>
          )}
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
