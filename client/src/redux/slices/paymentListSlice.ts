import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface PaymentListState {
  totalPayments: number
  pagePayments: number
  rowsPayments: number
  searchPayments: string
  statusFilter: string
  dateFilter: string
  patientFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: PaymentListState = {
  totalPayments: 0,
  pagePayments: 1,
  rowsPayments: 10,
  searchPayments: '',
  statusFilter: 'all',
  dateFilter: '',
  patientFilter: 'all',
  isLoading: false,
  error: null,
}

const paymentListSlice = createSlice({
  name: 'paymentList',
  initialState,
  reducers: {
    setTotalPayments: (state, action: PayloadAction<number>) => {
      state.totalPayments = action.payload
    },
    setPagePayments: (state, action: PayloadAction<number>) => {
      state.pagePayments = action.payload
    },
    setRowsPayments: (state, action: PayloadAction<number>) => {
      state.rowsPayments = action.payload
    },
    setSearchPayments: (state, action: PayloadAction<string>) => {
      state.searchPayments = action.payload
    },
    setPaymentStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setPaymentDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setPaymentPatientFilter: (state, action: PayloadAction<string>) => {
      state.patientFilter = action.payload
    },
    setPaymentListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setPaymentListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetPaymentListFilters: (state) => {
      state.searchPayments = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.patientFilter = 'all'
      state.pagePayments = 1
    },
  },
})

export const {
  setTotalPayments,
  setPagePayments,
  setRowsPayments,
  setSearchPayments,
  setPaymentStatusFilter,
  setPaymentDateFilter,
  setPaymentPatientFilter,
  setPaymentListLoading,
  setPaymentListError,
  resetPaymentListFilters,
} = paymentListSlice.actions

export const selectTotalPayments = (state: RootState) =>
  state.paymentList.totalPayments
export const selectPagePayments = (state: RootState) =>
  state.paymentList.pagePayments
export const selectRowsPayments = (state: RootState) =>
  state.paymentList.rowsPayments
export const selectSearchPayments = (state: RootState) =>
  state.paymentList.searchPayments
export const selectPaymentStatusFilter = (state: RootState) =>
  state.paymentList.statusFilter
export const selectPaymentDateFilter = (state: RootState) =>
  state.paymentList.dateFilter
export const selectPaymentPatientFilter = (state: RootState) =>
  state.paymentList.patientFilter
export const selectPaymentListLoading = (state: RootState) =>
  state.paymentList.isLoading
export const selectPaymentListError = (state: RootState) =>
  state.paymentList.error

export default paymentListSlice.reducer
