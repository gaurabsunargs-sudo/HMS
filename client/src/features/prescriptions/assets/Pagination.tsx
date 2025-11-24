import {
  selectPagePrescriptions,
  selectRowsPrescriptions,
  selectTotalPrescriptions,
  setPagePrescriptions,
  setRowsPrescriptions,
} from '@/redux/slices/prescriptionListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const PrescriptionListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPagePrescriptions)
  const rows = useAppSelector(selectRowsPrescriptions)
  const total = useAppSelector(selectTotalPrescriptions)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPagePrescriptions(1))
  const handlePreviousPage = () =>
    dispatch(setPagePrescriptions(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPagePrescriptions(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPagePrescriptions(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPagePrescriptions(1))
    dispatch(setRowsPrescriptions(Number(value)))
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

export default PrescriptionListPagination
