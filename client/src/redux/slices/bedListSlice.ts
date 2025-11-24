import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface BedListState {
  totalBeds: number
  pageBeds: number
  rowsBeds: number
  searchBeds: string
  bedTypeFilter: string
  occupancyFilter: string
  wardFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: BedListState = {
  totalBeds: 0,
  pageBeds: 1,
  rowsBeds: 10,
  searchBeds: '',
  bedTypeFilter: 'all',
  occupancyFilter: 'all',
  wardFilter: 'all',
  isLoading: false,
  error: null,
}

const bedListSlice = createSlice({
  name: 'bedList',
  initialState,
  reducers: {
    setTotalBeds: (state, action: PayloadAction<number>) => {
      state.totalBeds = action.payload
    },
    setPageBeds: (state, action: PayloadAction<number>) => {
      state.pageBeds = action.payload
    },
    setRowsBeds: (state, action: PayloadAction<number>) => {
      state.rowsBeds = action.payload
    },
    setSearchBeds: (state, action: PayloadAction<string>) => {
      state.searchBeds = action.payload
    },
    setBedTypeFilter: (state, action: PayloadAction<string>) => {
      state.bedTypeFilter = action.payload
    },
    setOccupancyFilter: (state, action: PayloadAction<string>) => {
      state.occupancyFilter = action.payload
    },
    setWardFilter: (state, action: PayloadAction<string>) => {
      state.wardFilter = action.payload
    },
    setBedListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setBedListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetBedListFilters: (state) => {
      state.searchBeds = ''
      state.bedTypeFilter = 'all'
      state.occupancyFilter = 'all'
      state.wardFilter = 'all'
      state.pageBeds = 1
    },
  },
})

export const {
  setTotalBeds,
  setPageBeds,
  setRowsBeds,
  setSearchBeds,
  setBedTypeFilter,
  setOccupancyFilter,
  setWardFilter,
  setBedListLoading,
  setBedListError,
  resetBedListFilters,
} = bedListSlice.actions

export const selectTotalBeds = (state: RootState) => state.bedList.totalBeds
export const selectPageBeds = (state: RootState) => state.bedList.pageBeds
export const selectRowsBeds = (state: RootState) => state.bedList.rowsBeds
export const selectSearchBeds = (state: RootState) => state.bedList.searchBeds
export const selectBedTypeFilter = (state: RootState) => state.bedList.bedTypeFilter
export const selectOccupancyFilter = (state: RootState) => state.bedList.occupancyFilter
export const selectWardFilter = (state: RootState) => state.bedList.wardFilter
export const selectBedListLoading = (state: RootState) => state.bedList.isLoading
export const selectBedListError = (state: RootState) => state.bedList.error

export default bedListSlice.reducer
