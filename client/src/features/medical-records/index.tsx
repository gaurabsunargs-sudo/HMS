import { useEffect } from 'react'
import {
  selectPageMedicalRecords,
  selectRowsMedicalRecords,
  selectSearchMedicalRecords,
  setTotalMedicalRecords,
} from '@/redux/slices/medicalRecordListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useMedicalRecords } from '@/api/hooks/useMedicalRecords'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const MedicalRecordList = () => {
  const page = useAppSelector(selectPageMedicalRecords)
  const limit = useAppSelector(selectRowsMedicalRecords)
  const search = useAppSelector(selectSearchMedicalRecords)
  const dispatch = useAppDispatch()

  const {
    data: medicalRecordListData,
    isLoading,
    isError,
    error,
  } = useMedicalRecords({ page, limit, search })

  useEffect(() => {
    if (medicalRecordListData?.meta.pagination.total) {
      dispatch(
        setTotalMedicalRecords(medicalRecordListData?.meta.pagination.total)
      )
    }
  }, [medicalRecordListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='MedicalRecord List'
        description='All medicalRecord list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={medicalRecordListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default MedicalRecordList
