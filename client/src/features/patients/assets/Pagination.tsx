import {
  selectPagePatients,
  selectRowsPatients,
  selectTotalPatients,
  setPagePatients,
  setRowsPatients,
} from '@/redux/slices/patientListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const PatientListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPagePatients)
  const rows = useAppSelector(selectRowsPatients)
  const total = useAppSelector(selectTotalPatients)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPagePatients(1))
  const handlePreviousPage = () =>
    dispatch(setPagePatients(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPagePatients(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPagePatients(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPagePatients(1))
    dispatch(setRowsPatients(Number(value)))
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

export default PatientListPagination
