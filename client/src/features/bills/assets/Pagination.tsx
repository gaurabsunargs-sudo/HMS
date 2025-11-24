import {
  selectPageBills,
  selectRowsBills,
  selectTotalBills,
  setPageBills,
  setRowsBills,
} from '@/redux/slices/billListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const BillListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageBills)
  const rows = useAppSelector(selectRowsBills)
  const total = useAppSelector(selectTotalBills)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageBills(1))
  const handlePreviousPage = () => dispatch(setPageBills(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageBills(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageBills(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageBills(1))
    dispatch(setRowsBills(Number(value)))
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

export default BillListPagination
