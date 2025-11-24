import {
  selectPageAppointments,
  selectRowsAppointments,
  selectTotalAppointments,
  setPageAppointments,
  setRowsAppointments,
} from '@/redux/slices/appointmentListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const AppointmentListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageAppointments)
  const rows = useAppSelector(selectRowsAppointments)
  const total = useAppSelector(selectTotalAppointments)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageAppointments(1))
  const handlePreviousPage = () =>
    dispatch(setPageAppointments(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageAppointments(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageAppointments(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageAppointments(1))
    dispatch(setRowsAppointments(Number(value)))
  }

  return (
    <div>
      <PaginationUI
        handleRowsPerPageChange={handleRowsPerPageChange}
        rows={rows}
        endItem={endItem}
        startItem={startItem}
        total={total}
        page={page}
        handleFirstPage={handleFirstPage}
        handlePreviousPage={handlePreviousPage}
        handleNextPage={handleNextPage}
        handleLastPage={handleLastPage}
        totalPages={totalPages}
      />
    </div>
  )
}

export default AppointmentListPagination
