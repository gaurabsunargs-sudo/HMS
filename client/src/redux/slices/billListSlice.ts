import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface BillListState {
  totalBills: number
  pageBills: number
  rowsBills: number
  searchBills: string
  statusFilter: string
  dateFilter: string
  patientFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: BillListState = {
  totalBills: 0,
  pageBills: 1,
  rowsBills: 10,
  searchBills: '',
  statusFilter: 'all',
  dateFilter: '',
  patientFilter: 'all',
  isLoading: false,
  error: null,
}

const billListSlice = createSlice({
  name: 'billList',
  initialState,
  reducers: {
    setTotalBills: (state, action: PayloadAction<number>) => {
      state.totalBills = action.payload
    },
    setPageBills: (state, action: PayloadAction<number>) => {
      state.pageBills = action.payload
    },
    setRowsBills: (state, action: PayloadAction<number>) => {
      state.rowsBills = action.payload
    },
    setSearchBills: (state, action: PayloadAction<string>) => {
      state.searchBills = action.payload
    },
    setBillStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setBillDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload
    },
    setBillPatientFilter: (state, action: PayloadAction<string>) => {
      state.patientFilter = action.payload
    },
    setBillListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setBillListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetBillListFilters: (state) => {
      state.searchBills = ''
      state.statusFilter = 'all'
      state.dateFilter = ''
      state.patientFilter = 'all'
      state.pageBills = 1
    },
  },
})

export const {
  setTotalBills,
  setPageBills,
  setRowsBills,
  setSearchBills,
  setBillStatusFilter,
  setBillDateFilter,
  setBillPatientFilter,
  setBillListLoading,
  setBillListError,
  resetBillListFilters,
} = billListSlice.actions

export const selectTotalBills = (state: RootState) => state.billList.totalBills
export const selectPageBills = (state: RootState) => state.billList.pageBills
export const selectRowsBills = (state: RootState) => state.billList.rowsBills
export const selectSearchBills = (state: RootState) => state.billList.searchBills
export const selectBillStatusFilter = (state: RootState) => state.billList.statusFilter
export const selectBillDateFilter = (state: RootState) => state.billList.dateFilter
export const selectBillPatientFilter = (state: RootState) => state.billList.patientFilter
export const selectBillListLoading = (state: RootState) => state.billList.isLoading
export const selectBillListError = (state: RootState) => state.billList.error

export default billListSlice.reducer
