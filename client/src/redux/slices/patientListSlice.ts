import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface PatientListState {
  totalPatients: number
  pagePatients: number
  rowsPatients: number
  searchPatients: string
  bloodGroupFilter: string
  genderFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: PatientListState = {
  totalPatients: 0,
  pagePatients: 1,
  rowsPatients: 10,
  searchPatients: '',
  bloodGroupFilter: 'all',
  genderFilter: 'all',
  isLoading: false,
  error: null,
}

const patientListSlice = createSlice({
  name: 'patientList',
  initialState,
  reducers: {
    setTotalPatients: (state, action: PayloadAction<number>) => {
      state.totalPatients = action.payload
    },
    setPagePatients: (state, action: PayloadAction<number>) => {
      state.pagePatients = action.payload
    },
    setRowsPatients: (state, action: PayloadAction<number>) => {
      state.rowsPatients = action.payload
    },
    setSearchPatients: (state, action: PayloadAction<string>) => {
      state.searchPatients = action.payload
    },
    setBloodGroupFilter: (state, action: PayloadAction<string>) => {
      state.bloodGroupFilter = action.payload
    },
    setGenderFilter: (state, action: PayloadAction<string>) => {
      state.genderFilter = action.payload
    },
    setPatientListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setPatientListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetPatientListFilters: (state) => {
      state.searchPatients = ''
      state.bloodGroupFilter = 'all'
      state.genderFilter = 'all'
      state.pagePatients = 1
    },
  },
})

export const {
  setTotalPatients,
  setPagePatients,
  setRowsPatients,
  setSearchPatients,
  setBloodGroupFilter,
  setGenderFilter,
  setPatientListLoading,
  setPatientListError,
  resetPatientListFilters,
} = patientListSlice.actions

export const selectTotalPatients = (state: RootState) => state.patientList.totalPatients
export const selectPagePatients = (state: RootState) => state.patientList.pagePatients
export const selectRowsPatients = (state: RootState) => state.patientList.rowsPatients
export const selectSearchPatients = (state: RootState) => state.patientList.searchPatients
export const selectBloodGroupFilter = (state: RootState) => state.patientList.bloodGroupFilter
export const selectGenderFilter = (state: RootState) => state.patientList.genderFilter
export const selectPatientListLoading = (state: RootState) => state.patientList.isLoading
export const selectPatientListError = (state: RootState) => state.patientList.error

export default patientListSlice.reducer
