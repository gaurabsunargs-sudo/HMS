import { useEffect } from 'react'
import {
  selectPageBills,
  selectRowsBills,
  selectSearchBills,
  setTotalBills,
} from '@/redux/slices/billListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useBills } from '@/api/hooks/useBills'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const BillList = () => {
  const page = useAppSelector(selectPageBills)
  const limit = useAppSelector(selectRowsBills)
  const search = useAppSelector(selectSearchBills)
  const dispatch = useAppDispatch()

  const {
    data: billListData,
    isLoading,
    isError,
    error,
  } = useBills({ page, limit, search })

  useEffect(() => {
    if (billListData?.meta.pagination.total) {
      dispatch(setTotalBills(billListData?.meta.pagination.total))
    }
  }, [billListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Bill List'
        description='All bill list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={billListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default BillList
