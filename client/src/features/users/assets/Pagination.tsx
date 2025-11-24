import {
  selectPageUsers,
  selectRowsUsers,
  selectTotalUsers,
  setPageUsers,
  setRowsUsers,
} from '@/redux/slices/userListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const UserListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageUsers)
  const rows = useAppSelector(selectRowsUsers)
  const total = useAppSelector(selectTotalUsers)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageUsers(1))
  const handlePreviousPage = () => dispatch(setPageUsers(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageUsers(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageUsers(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageUsers(1))
    dispatch(setRowsUsers(Number(value)))
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

export default UserListPagination
