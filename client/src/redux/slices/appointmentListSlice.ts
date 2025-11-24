import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface AppointmentListState {
  totalAppointments: number
  pageAppointments: number
  rowsAppointments: number
  searchAppointments: string
  statusFilter: string
  dateFilter: string
  doctorFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: AppointmentListState = {
  totalAppointments: 0,
  pageAppointments: 1,
  rowsAppointments: 10,
  searchAppointments: '',
  statusFilter: 'all',
  dateFilter: '',
  doctorFilter: 'all',
  isLoading: false,
  error: null,
}

const appointmentListSlice = createSlice({
  name: 'appointmentList',
  initialState,
  reducers: {
    setTotalAppointments: (state, action: PayloadAction<number>) => {
      state.totalAppointments = action.payload
    },
    setPageAppointments: (state, action: PayloadAction<number>) => {
      state.pageAppointments = action.payload
    },
    setRowsAppointments: (state, action: PayloadAction<number>) => {
      state.rowsAppointments = action.payload
    },
    setSearchAppointments: (state, action: PayloadAction<string>) => {
      state.searchAppointments = action.payload
    },
    setAppointmentStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setAppointmentDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setAppointmentDoctorFilter: (state, action: PayloadAction<string>) => {
      state.doctorFilter = action.payload
    },
    setAppointmentListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setAppointmentListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetAppointmentListFilters: (state) => {
      state.searchAppointments = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.doctorFilter = 'all'
      state.pageAppointments = 1
    },
  },
})

export const {
  setTotalAppointments,
  setPageAppointments,
  setRowsAppointments,
  setSearchAppointments,
  setAppointmentStatusFilter,
  setAppointmentDateFilter,
  setAppointmentDoctorFilter,
  setAppointmentListLoading,
  setAppointmentListError,
  resetAppointmentListFilters,
} = appointmentListSlice.actions

export const selectTotalAppointments = (state: RootState) => state.appointmentList.totalAppointments
export const selectPageAppointments = (state: RootState) => state.appointmentList.pageAppointments
export const selectRowsAppointments = (state: RootState) => state.appointmentList.rowsAppointments
export const selectSearchAppointments = (state: RootState) => state.appointmentList.searchAppointments
export const selectAppointmentStatusFilter = (state: RootState) => state.appointmentList.statusFilter
export const selectAppointmentDateFilter = (state: RootState) => state.appointmentList.dateFilter
export const selectAppointmentDoctorFilter = (state: RootState) => state.appointmentList.doctorFilter
export const selectAppointmentListLoading = (state: RootState) => state.appointmentList.isLoading
export const selectAppointmentListError = (state: RootState) => state.appointmentList.error

export default appointmentListSlice.reducer
