import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface EquipmentListState {
  totalEquipment: number
  pageEquipment: number
  rowsEquipment: number
  searchEquipment: string
  typeFilter: string
  statusFilter: string
  locationFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: EquipmentListState = {
  totalEquipment: 0,
  pageEquipment: 1,
  rowsEquipment: 10,
  searchEquipment: '',
  typeFilter: 'all',
  statusFilter: 'all',
  locationFilter: 'all',
  isLoading: false,
  error: null,
}

const equipmentListSlice = createSlice({
  name: 'equipmentList',
  initialState,
  reducers: {
    setTotalEquipment: (state, action: PayloadAction<number>) => {
      state.totalEquipment = action.payload
    },
    setPageEquipment: (state, action: PayloadAction<number>) => {
      state.pageEquipment = action.payload
    },
    setRowsEquipment: (state, action: PayloadAction<number>) => {
      state.rowsEquipment = action.payload
    },
    setSearchEquipment: (state, action: PayloadAction<string>) => {
      state.searchEquipment = action.payload
    },
    setEquipmentTypeFilter: (state, action: PayloadAction<string>) => {
      state.typeFilter = action.payload
    },
    setEquipmentStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setEquipmentLocationFilter: (state, action: PayloadAction<string>) => {
      state.locationFilter = action.payload
    },
    setEquipmentListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setEquipmentListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetEquipmentListFilters: (state) => {
      state.searchEquipment = ''
      state.typeFilter = 'all'
      state.statusFilter = 'all'
      state.locationFilter = 'all'
      state.pageEquipment = 1
    },
  },
})

export const {
  setTotalEquipment,
  setPageEquipment,
  setRowsEquipment,
  setSearchEquipment,
  setEquipmentTypeFilter,
  setEquipmentStatusFilter,
  setEquipmentLocationFilter,
  setEquipmentListLoading,
  setEquipmentListError,
  resetEquipmentListFilters,
} = equipmentListSlice.actions

export const selectTotalEquipment = (state: RootState) => state.equipmentList.totalEquipment
export const selectPageEquipment = (state: RootState) => state.equipmentList.pageEquipment
export const selectRowsEquipment = (state: RootState) => state.equipmentList.rowsEquipment
export const selectSearchEquipment = (state: RootState) => state.equipmentList.searchEquipment
export const selectEquipmentTypeFilter = (state: RootState) => state.equipmentList.typeFilter
export const selectEquipmentStatusFilter = (state: RootState) => state.equipmentList.statusFilter
export const selectEquipmentLocationFilter = (state: RootState) => state.equipmentList.locationFilter
export const selectEquipmentListLoading = (state: RootState) => state.equipmentList.isLoading
export const selectEquipmentListError = (state: RootState) => state.equipmentList.error

export default equipmentListSlice.reducer
