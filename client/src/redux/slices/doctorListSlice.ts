import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface DoctorListState {
  totalDoctors: number
  pageDoctors: number
  rowsDoctors: number
  searchDoctors: string
  specializationFilter: string
  availabilityFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: DoctorListState = {
  totalDoctors: 0,
  pageDoctors: 1,
  rowsDoctors: 10,
  searchDoctors: '',
  specializationFilter: 'all',
  availabilityFilter: 'all',
  isLoading: false,
  error: null,
}

const doctorListSlice = createSlice({
  name: 'doctorList',
  initialState,
  reducers: {
    setTotalDoctors: (state, action: PayloadAction<number>) => {
      state.totalDoctors = action.payload
    },
    setPageDoctors: (state, action: PayloadAction<number>) => {
      state.pageDoctors = action.payload
    },
    setRowsDoctors: (state, action: PayloadAction<number>) => {
      state.rowsDoctors = action.payload
    },
    setSearchDoctors: (state, action: PayloadAction<string>) => {
      state.searchDoctors = action.payload
    },
    setSpecializationFilter: (state, action: PayloadAction<string>) => {
      state.specializationFilter = action.payload
    },
    setAvailabilityFilter: (state, action: PayloadAction<string>) => {
      state.availabilityFilter = action.payload
    },
    setDoctorListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setDoctorListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetDoctorListFilters: (state) => {
      state.searchDoctors = ''
      state.specializationFilter = 'all'
      state.availabilityFilter = 'all'
      state.pageDoctors = 1
    },
  },
})

export const {
  setTotalDoctors,
  setPageDoctors,
  setRowsDoctors,
  setSearchDoctors,
  setSpecializationFilter,
  setAvailabilityFilter,
  setDoctorListLoading,
  setDoctorListError,
  resetDoctorListFilters,
} = doctorListSlice.actions

export const selectTotalDoctors = (state: RootState) => state.doctorList.totalDoctors
export const selectPageDoctors = (state: RootState) => state.doctorList.pageDoctors
export const selectRowsDoctors = (state: RootState) => state.doctorList.rowsDoctors
export const selectSearchDoctors = (state: RootState) => state.doctorList.searchDoctors
export const selectSpecializationFilter = (state: RootState) => state.doctorList.specializationFilter
export const selectAvailabilityFilter = (state: RootState) => state.doctorList.availabilityFilter
export const selectDoctorListLoading = (state: RootState) => state.doctorList.isLoading
export const selectDoctorListError = (state: RootState) => state.doctorList.error

export default doctorListSlice.reducer
