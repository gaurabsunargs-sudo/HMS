import {
  selectPageMedicalRecords,
  selectRowsMedicalRecords,
  selectTotalMedicalRecords,
  setPageMedicalRecords,
  setRowsMedicalRecords,
} from '@/redux/slices/medicalRecordListSlice'
import { useAppSelector, useAppDispatch } from '@/redux/store'
import PaginationUI from '@/components/table/pagination/PaginationUI'

const MedicalRecordListPagination = () => {
  const dispatch = useAppDispatch()
  const page = useAppSelector(selectPageMedicalRecords)
  const rows = useAppSelector(selectRowsMedicalRecords)
  const total = useAppSelector(selectTotalMedicalRecords)

  const totalPages = Math.ceil(total / rows)
  const startItem = (page - 1) * rows + 1
  const endItem = Math.min(startItem + rows - 1, total)

  const handleFirstPage = () => dispatch(setPageMedicalRecords(1))
  const handlePreviousPage = () =>
    dispatch(setPageMedicalRecords(Math.max(1, page - 1)))
  const handleNextPage = () =>
    dispatch(setPageMedicalRecords(Math.min(page + 1, totalPages)))
  const handleLastPage = () => dispatch(setPageMedicalRecords(totalPages))

  const handleRowsPerPageChange = (value: string) => {
    dispatch(setPageMedicalRecords(1))
    dispatch(setRowsMedicalRecords(Number(value)))
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

export default MedicalRecordListPagination
