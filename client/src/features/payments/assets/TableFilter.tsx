import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Table } from '@tanstack/react-table'
import {
  setPagePayments,
  setSearchPayments,
  setTotalPayments,
} from '@/redux/slices/paymentListSlice'
import { useAppDispatch } from '@/redux/store'
import { Plus, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '@/components/table/ViewOptions'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function TopSearchContent<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const dispatch = useAppDispatch()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchInput = useDebounce(searchInput, 300)

  useEffect(() => {
    dispatch(setPagePayments(1))
    dispatch(setTotalPayments(0))
    dispatch(setSearchPayments(debouncedSearchInput))
  }, [debouncedSearchInput, dispatch])
  const navigation = useNavigate()
  return (
    <div className='flex w-full flex-col flex-wrap gap-3'>
      <div className='flex items-center justify-between'>
        <div className='flex w-1/2 gap-3'>
          <div className='h-9 w-[180px] lg:w-[320px]'>
            <Input
              placeholder='Search...'
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className='h-9 w-full'
              startContent={<Search size={16} />}
            />
          </div>

          <div className='flex flex-1 flex-wrap items-center gap-2'>
            {isFiltered && (
              <Button
                variant='outline'
                onClick={() => table.resetColumnFilters()}
                className='h-8 px-2 lg:px-3'
              >
                Reset
                <Plus className='ml-2 h-4 w-4 rotate-45' />
              </Button>
            )}
          </div>
        </div>
        <div className='flex gap-3'>
          <DataTableViewOptions table={table} />
          <Button onClick={() => navigation({ to: '/dashboard/payments/add' })}>
            Add Payment <Plus size={16} className='ml-1' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TopSearchContent
