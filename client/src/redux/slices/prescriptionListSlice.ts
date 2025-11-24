import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface PrescriptionListState {
  totalPrescriptions: number
  pagePrescriptions: number
  rowsPrescriptions: number
  searchPrescriptions: string
  statusFilter: string
  dateFilter: string
  doctorFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: PrescriptionListState = {
  totalPrescriptions: 0,
  pagePrescriptions: 1,
  rowsPrescriptions: 10,
  searchPrescriptions: '',
  statusFilter: 'all',
  dateFilter: '',
  doctorFilter: 'all',
  isLoading: false,
  error: null,
}

const prescriptionListSlice = createSlice({
  name: 'prescriptionList',
  initialState,
  reducers: {
    setTotalPrescriptions: (state, action: PayloadAction<number>) => {
      state.totalPrescriptions = action.payload
    },
    setPagePrescriptions: (state, action: PayloadAction<number>) => {
      state.pagePrescriptions = action.payload
    },
    setRowsPrescriptions: (state, action: PayloadAction<number>) => {
      state.rowsPrescriptions = action.payload
    },
    setSearchPrescriptions: (state, action: PayloadAction<string>) => {
      state.searchPrescriptions = action.payload
    },
    setPrescriptionStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setPrescriptionDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setPrescriptionDoctorFilter: (state, action: PayloadAction<string>) => {
      state.doctorFilter = action.payload
    },
    setPrescriptionListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setPrescriptionListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetPrescriptionListFilters: (state) => {
      state.searchPrescriptions = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.doctorFilter = 'all'
      state.pagePrescriptions = 1
    },
  },
})

export const {
  setTotalPrescriptions,
  setPagePrescriptions,
  setRowsPrescriptions,
  setSearchPrescriptions,
  setPrescriptionStatusFilter,
  setPrescriptionDateFilter,
  setPrescriptionDoctorFilter,
  setPrescriptionListLoading,
  setPrescriptionListError,
  resetPrescriptionListFilters,
} = prescriptionListSlice.actions

export const selectTotalPrescriptions = (state: RootState) =>
  state.prescriptionList.totalPrescriptions
export const selectPagePrescriptions = (state: RootState) =>
  state.prescriptionList.pagePrescriptions
export const selectRowsPrescriptions = (state: RootState) =>
  state.prescriptionList.rowsPrescriptions
export const selectSearchPrescriptions = (state: RootState) =>
  state.prescriptionList.searchPrescriptions
export const selectPrescriptionStatusFilter = (state: RootState) =>
  state.prescriptionList.statusFilter
export const selectPrescriptionDateFilter = (state: RootState) =>
  state.prescriptionList.dateFilter
export const selectPrescriptionDoctorFilter = (state: RootState) =>
  state.prescriptionList.doctorFilter
export const selectPrescriptionListLoading = (state: RootState) =>
  state.prescriptionList.isLoading
export const selectPrescriptionListError = (state: RootState) =>
  state.prescriptionList.error

export default prescriptionListSlice.reducer
