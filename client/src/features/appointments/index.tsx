import { useEffect } from 'react'
import {
  selectPageAppointments,
  selectRowsAppointments,
  selectSearchAppointments,
  setTotalAppointments,
} from '@/redux/slices/appointmentListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useAppointments } from '@/api/hooks/useAppointments'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const AppointmentList = () => {
  const page = useAppSelector(selectPageAppointments)
  const limit = useAppSelector(selectRowsAppointments)
  const search = useAppSelector(selectSearchAppointments)
  const dispatch = useAppDispatch()

  const {
    data: appointmentListData,
    isLoading,
    isError,
    error,
  } = useAppointments({ page, limit, search })

  useEffect(() => {
    if (appointmentListData?.meta.pagination.total) {
      dispatch(setTotalAppointments(appointmentListData?.meta.pagination.total))
    }
  }, [appointmentListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='Appointment List'
        description='All appointment list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={appointmentListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default AppointmentList
