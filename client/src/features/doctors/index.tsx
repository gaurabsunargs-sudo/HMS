import { useEffect } from 'react'
import {
  selectPageDoctors,
  selectRowsDoctors,
  selectSearchDoctors,
  setTotalDoctors,
} from '@/redux/slices/doctorListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useDoctors } from '@/api/hooks/useDoctors'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const DoctorList = () => {
  const page = useAppSelector(selectPageDoctors)
  const limit = useAppSelector(selectRowsDoctors)
  const search = useAppSelector(selectSearchDoctors)
  const dispatch = useAppDispatch()

  const {
    data: doctorListData,
    isLoading,
    isError,
    error,
  } = useDoctors({ page, limit, search })

  useEffect(() => {
    if (doctorListData?.meta.pagination.total) {
      dispatch(setTotalDoctors(doctorListData?.meta.pagination.total))
    }
  }, [doctorListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Doctor List'
        description='All doctor list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={doctorListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default DoctorList
