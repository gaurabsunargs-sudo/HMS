import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface MedicalRecordListState {
  totalMedicalRecords: number
  pageMedicalRecords: number
  rowsMedicalRecords: number
  searchMedicalRecords: string
  statusFilter: string
  dateFilter: string
  doctorFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: MedicalRecordListState = {
  totalMedicalRecords: 0,
  pageMedicalRecords: 1,
  rowsMedicalRecords: 10,
  searchMedicalRecords: '',
  statusFilter: 'all',
  dateFilter: '',
  doctorFilter: 'all',
  isLoading: false,
  error: null,
}

const medicalRecordListSlice = createSlice({
  name: 'medicalRecordList',
  initialState,
  reducers: {
    setTotalMedicalRecords: (state, action: PayloadAction<number>) => {
      state.totalMedicalRecords = action.payload
    },
    setPageMedicalRecords: (state, action: PayloadAction<number>) => {
      state.pageMedicalRecords = action.payload
    },
    setRowsMedicalRecords: (state, action: PayloadAction<number>) => {
      state.rowsMedicalRecords = action.payload
    },
    setSearchMedicalRecords: (state, action: PayloadAction<string>) => {
      state.searchMedicalRecords = action.payload
    },
    setMedicalRecordStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setMedicalRecordDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setMedicalRecordDoctorFilter: (state, action: PayloadAction<string>) => {
      state.doctorFilter = action.payload
    },
    setMedicalRecordListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setMedicalRecordListError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload
    },
    resetMedicalRecordListFilters: (state) => {
      state.searchMedicalRecords = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.doctorFilter = 'all'
      state.pageMedicalRecords = 1
    },
  },
})

export const {
  setTotalMedicalRecords,
  setPageMedicalRecords,
  setRowsMedicalRecords,
  setSearchMedicalRecords,
  setMedicalRecordStatusFilter,
  setMedicalRecordDateFilter,
  setMedicalRecordDoctorFilter,
  setMedicalRecordListLoading,
  setMedicalRecordListError,
  resetMedicalRecordListFilters,
} = medicalRecordListSlice.actions

export const selectTotalMedicalRecords = (state: RootState) =>
  state.medicalRecordList.totalMedicalRecords
export const selectPageMedicalRecords = (state: RootState) =>
  state.medicalRecordList.pageMedicalRecords
export const selectRowsMedicalRecords = (state: RootState) =>
  state.medicalRecordList.rowsMedicalRecords
export const selectSearchMedicalRecords = (state: RootState) =>
  state.medicalRecordList.searchMedicalRecords
export const selectMedicalRecordStatusFilter = (state: RootState) =>
  state.medicalRecordList.statusFilter
export const selectMedicalRecordDateFilter = (state: RootState) =>
  state.medicalRecordList.dateFilter
export const selectMedicalRecordDoctorFilter = (state: RootState) =>
  state.medicalRecordList.doctorFilter
export const selectMedicalRecordListLoading = (state: RootState) =>
  state.medicalRecordList.isLoading
export const selectMedicalRecordListError = (state: RootState) =>
  state.medicalRecordList.error

export default medicalRecordListSlice.reducer
