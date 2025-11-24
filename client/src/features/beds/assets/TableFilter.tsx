import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Table } from '@tanstack/react-table'
import {
  setPageBeds,
  setSearchBeds,
  setTotalBeds,
} from '@/redux/slices/bedListSlice'
import {
  selectOccupancyFilter,
  setOccupancyFilter,
} from '@/redux/slices/bedListSlice'
import { useAppDispatch } from '@/redux/store'
import { useAppSelector } from '@/redux/store'
import { Plus, Search } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
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
  const occupancy = useAppSelector(selectOccupancyFilter)

  useEffect(() => {
    dispatch(setPageBeds(1))
    dispatch(setTotalBeds(0))
    dispatch(setSearchBeds(debouncedSearchInput))
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
            <div className='w-60'>
              <SelectDropdown
                defaultValue={occupancy}
                onValueChange={(v) => dispatch(setOccupancyFilter(String(v)))}
                items={[
                  { label: 'All', value: 'all' },
                  { label: 'Show Occupied (Admit)', value: 'occupied' },
                  { label: 'Show Available (Discharge)', value: 'available' },
                ]}
                placeholder='Filter beds'
                isControlled
                withinForm={false}
              />
            </div>
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
          <Button onClick={() => navigation({ to: '/dashboard/beds/add' })}>
            Add Bed <Plus size={16} className='ml-1' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TopSearchContent
