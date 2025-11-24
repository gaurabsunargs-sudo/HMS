import {
  selectPageAdmissions,
  selectRowsAdmissions,
  selectTotalAdmissions,
  setPageAdmissions,
  setRowsAdmissions,
} from '@/redux/slices/admissionListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const AdmissionListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageAdmissions)
  const rows = useAppSelector(selectRowsAdmissions)
  const total = useAppSelector(selectTotalAdmissions)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageAdmissions(1))
  const handlePreviousPage = () =>
    dispatch(setPageAdmissions(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageAdmissions(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageAdmissions(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageAdmissions(1))
    dispatch(setRowsAdmissions(Number(value)))
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

export default AdmissionListPagination
