import {
  selectPageBeds,
  selectRowsBeds,
  selectTotalBeds,
  setPageBeds,
  setRowsBeds,
} from '@/redux/slices/bedListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const BedListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageBeds)
  const rows = useAppSelector(selectRowsBeds)
  const total = useAppSelector(selectTotalBeds)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageBeds(1))
  const handlePreviousPage = () => dispatch(setPageBeds(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageBeds(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageBeds(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageBeds(1))
    dispatch(setRowsBeds(Number(value)))
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

export default BedListPagination
