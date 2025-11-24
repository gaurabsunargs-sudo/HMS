import { useEffect } from 'react'
import {
  selectPageAdmissions,
  selectRowsAdmissions,
  selectSearchAdmissions,
  setTotalAdmissions,
} from '@/redux/slices/admissionListSlice'
import { selectAdmissionStatusFilter } from '@/redux/slices/admissionListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useAdmissions } from '@/api/hooks/useAdmissions'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const AdmissionList = () => {
  const page = useAppSelector(selectPageAdmissions)
  const limit = useAppSelector(selectRowsAdmissions)
  const search = useAppSelector(selectSearchAdmissions)
  const dispatch = useAppDispatch()
  const status = useAppSelector(selectAdmissionStatusFilter)

  const {
    data: admissionListData,
    isLoading,
    isError,
    error,
  } = useAdmissions({
    page,
    limit,
    search,
    status: status === 'all' ? '' : status,
  })

  useEffect(() => {
    if (admissionListData?.meta.pagination.total) {
      dispatch(setTotalAdmissions(admissionListData?.meta.pagination.total))
    }
  }, [admissionListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Admission List'
        description='All admission list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={admissionListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default AdmissionList
