import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface InventoryListState {
  totalInventory: number
  pageInventory: number
  rowsInventory: number
  searchInventory: string
  categoryFilter: string
  statusFilter: string
  lowStockOnly: boolean
  isLoading: boolean
  error: string | null
}

const initialState: InventoryListState = {
  totalInventory: 0,
  pageInventory: 1,
  rowsInventory: 10,
  searchInventory: '',
  categoryFilter: 'all',
  statusFilter: 'all',
  lowStockOnly: false,
  isLoading: false,
  error: null,
}

const inventoryListSlice = createSlice({
  name: 'inventoryList',
  initialState,
  reducers: {
    setTotalInventory: (state, action: PayloadAction<number>) => {
      state.totalInventory = action.payload
    },
    setPageInventory: (state, action: PayloadAction<number>) => {
      state.pageInventory = action.payload
    },
    setRowsInventory: (state, action: PayloadAction<number>) => {
      state.rowsInventory = action.payload
    },
    setSearchInventory: (state, action: PayloadAction<string>) => {
      state.searchInventory = action.payload
    },
    setInventoryCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload
    },
    setInventoryStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setLowStockOnly: (state, action: PayloadAction<boolean>) => {
      state.lowStockOnly = action.payload
    },
    setInventoryListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setInventoryListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetInventoryListFilters: (state) => {
      state.searchInventory = ''
      state.categoryFilter = 'all'
      state.statusFilter = 'all'
      state.lowStockOnly = false
      state.pageInventory = 1
    },
  },
})

export const {
  setTotalInventory,
  setPageInventory,
  setRowsInventory,
  setSearchInventory,
  setInventoryCategoryFilter,
  setInventoryStatusFilter,
  setLowStockOnly,
  setInventoryListLoading,
  setInventoryListError,
  resetInventoryListFilters,
} = inventoryListSlice.actions

export const selectTotalInventory = (state: RootState) => state.inventoryList.totalInventory
export const selectPageInventory = (state: RootState) => state.inventoryList.pageInventory
export const selectRowsInventory = (state: RootState) => state.inventoryList.rowsInventory
export const selectSearchInventory = (state: RootState) => state.inventoryList.searchInventory
export const selectInventoryCategoryFilter = (state: RootState) => state.inventoryList.categoryFilter
export const selectInventoryStatusFilter = (state: RootState) => state.inventoryList.statusFilter
export const selectLowStockOnly = (state: RootState) => state.inventoryList.lowStockOnly
export const selectInventoryListLoading = (state: RootState) => state.inventoryList.isLoading
export const selectInventoryListError = (state: RootState) => state.inventoryList.error

export default inventoryListSlice.reducer
