import { useEffect } from 'react'
import {
  selectPagePatients,
  selectRowsPatients,
  selectSearchPatients,
  setTotalPatients,
} from '@/redux/slices/patientListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { usePatients } from '@/api/hooks/usePatients'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const PatientList = () => {
  const page = useAppSelector(selectPagePatients)
  const limit = useAppSelector(selectRowsPatients)
  const search = useAppSelector(selectSearchPatients)
  const dispatch = useAppDispatch()

  const {
    data: patientListData,
    isLoading,
    isError,
    error,
  } = usePatients({ page, limit, search })

  useEffect(() => {
    if (patientListData?.meta.pagination.total) {
      dispatch(setTotalPatients(patientListData?.meta.pagination.total))
    }
  }, [patientListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Patient List'
        description='All patient list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={patientListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default PatientList
