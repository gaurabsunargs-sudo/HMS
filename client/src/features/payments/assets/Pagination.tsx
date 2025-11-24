import {
  selectPagePayments,
  selectRowsPayments,
  selectTotalPayments,
  setPagePayments,
  setRowsPayments,
} from '@/redux/slices/paymentListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const PaymentListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPagePayments)
  const rows = useAppSelector(selectRowsPayments)
  const total = useAppSelector(selectTotalPayments)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPagePayments(1))
  const handlePreviousPage = () =>
    dispatch(setPagePayments(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPagePayments(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPagePayments(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPagePayments(1))
    dispatch(setRowsPayments(Number(value)))
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

export default PaymentListPagination
