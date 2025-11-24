import { useEffect, useMemo } from 'react'
import {
  selectPageBeds,
  selectRowsBeds,
  selectSearchBeds,
  setTotalBeds,
} from '@/redux/slices/bedListSlice'
import { selectOccupancyFilter } from '@/redux/slices/bedListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useBeds } from '@/api/hooks/useBeds'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const BedList = () => {
  const occupancy = useAppSelector(selectOccupancyFilter)
  const page = useAppSelector(selectPageBeds)
  const limit = useAppSelector(selectRowsBeds)
  const search = useAppSelector(selectSearchBeds)
  const dispatch = useAppDispatch()

  const {
    data: bedListData,
    isLoading,
    isError,
    error,
  } = useBeds({ page, limit, search })

  useEffect(() => {
    if (bedListData?.meta.pagination.total) {
      dispatch(setTotalBeds(bedListData?.meta.pagination.total))
    }
  }, [bedListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  const filteredData = useMemo(() => {
    const data = bedListData?.data || []
    if (occupancy === 'occupied') return data.filter((b: any) => b.isOccupied)
    if (occupancy === 'available') return data.filter((b: any) => !b.isOccupied)
    return data
  }, [bedListData, occupancy])

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader title='Bed List' description='All bed list are found here.' />
      {/* occupancy filter moved into TableFilter toolbar */}
      <DataTable
        loading={isLoading}
        data={filteredData}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default BedList
