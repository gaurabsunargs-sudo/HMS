import { useEffect } from 'react'
import {
  selectPagePrescriptions,
  selectRowsPrescriptions,
  selectSearchPrescriptions,
  setTotalPrescriptions,
} from '@/redux/slices/prescriptionListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { usePrescriptions } from '@/api/hooks/usePrescriptions'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const PrescriptionList = () => {
  const page = useAppSelector(selectPagePrescriptions)
  const limit = useAppSelector(selectRowsPrescriptions)
  const search = useAppSelector(selectSearchPrescriptions)
  const dispatch = useAppDispatch()

  const {
    data: prescriptionListData,
    isLoading,
    isError,
    error,
  } = usePrescriptions({ page, limit, search })

  useEffect(() => {
    if (prescriptionListData?.meta.pagination.total) {
      dispatch(
        setTotalPrescriptions(prescriptionListData?.meta.pagination.total)
      )
    }
  }, [prescriptionListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Prescription List'
        description='All prescription list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={prescriptionListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default PrescriptionList
