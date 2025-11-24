import { useEffect } from 'react'
import {
  selectPagePayments,
  selectRowsPayments,
  selectSearchPayments,
  setTotalPayments,
} from '@/redux/slices/paymentListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { usePayments } from '@/api/hooks/usePayments'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const PaymentList = () => {
  const page = useAppSelector(selectPagePayments)
  const limit = useAppSelector(selectRowsPayments)
  const search = useAppSelector(selectSearchPayments)
  const dispatch = useAppDispatch()

  const {
    data: paymentListData,
    isLoading,
    isError,
    error,
  } = usePayments({ page, limit, search })

  // Backend now handles aggregation, so use data directly
  const aggregatedData = paymentListData?.data || []

  useEffect(() => {
    if (paymentListData?.meta.pagination.total) {
      dispatch(setTotalPayments(paymentListData?.meta.pagination.total))
    }
  }, [paymentListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Payment List'
        description='All payment list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={aggregatedData}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default PaymentList
