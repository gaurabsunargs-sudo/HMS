import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface AdmissionListState {
  totalAdmissions: number
  pageAdmissions: number
  rowsAdmissions: number
  searchAdmissions: string
  statusFilter: string
  dateFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: AdmissionListState = {
  totalAdmissions: 0,
  pageAdmissions: 1,
  rowsAdmissions: 10,
  searchAdmissions: '',
  statusFilter: 'all',
  dateFilter: '',
  isLoading: false,
  error: null,
}

const admissionListSlice = createSlice({
  name: 'admissionList',
  initialState,
  reducers: {
    setTotalAdmissions: (state, action: PayloadAction<number>) => {
      state.totalAdmissions = action.payload
    },
    setPageAdmissions: (state, action: PayloadAction<number>) => {
      state.pageAdmissions = action.payload
    },
    setRowsAdmissions: (state, action: PayloadAction<number>) => {
      state.rowsAdmissions = action.payload
    },
    setSearchAdmissions: (state, action: PayloadAction<string>) => {
      state.searchAdmissions = action.payload
    },
    setAdmissionStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setAdmissionDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setAdmissionListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAdmissionListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetAdmissionListFilters: (state) => {
      state.searchAdmissions = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.pageAdmissions = 1
    },
  },
})

export const {
  setTotalAdmissions,
  setPageAdmissions,
  setRowsAdmissions,
  setSearchAdmissions,
  setAdmissionStatusFilter,
  setAdmissionDateFilter,
  setAdmissionListLoading,
  setAdmissionListError,
  resetAdmissionListFilters,
} = admissionListSlice.actions

export const selectTotalAdmissions = (state: RootState) => state.admissionList.totalAdmissions
export const selectPageAdmissions = (state: RootState) => state.admissionList.pageAdmissions
export const selectRowsAdmissions = (state: RootState) => state.admissionList.rowsAdmissions
export const selectSearchAdmissions = (state: RootState) => state.admissionList.searchAdmissions
export const selectAdmissionStatusFilter = (state: RootState) => state.admissionList.statusFilter
export const selectAdmissionDateFilter = (state: RootState) => state.admissionList.dateFilter
export const selectAdmissionListLoading = (state: RootState) => state.admissionList.isLoading
export const selectAdmissionListError = (state: RootState) => state.admissionList.error

export default admissionListSlice.reducer
