import {
  selectPageDoctors,
  selectRowsDoctors,
  selectTotalDoctors,
  setPageDoctors,
  setRowsDoctors,
} from '@/redux/slices/doctorListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const DoctorListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageDoctors)
  const rows = useAppSelector(selectRowsDoctors)
  const total = useAppSelector(selectTotalDoctors)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageDoctors(1))
  const handlePreviousPage = () =>
    dispatch(setPageDoctors(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageDoctors(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageDoctors(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageDoctors(1))
    dispatch(setRowsDoctors(Number(value)))
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

export default DoctorListPagination
