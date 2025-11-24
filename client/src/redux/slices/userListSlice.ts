import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface UserListState {
  totalUsers: number
  pageUsers: number
  rowsUsers: number
  searchUsers: string
  roleFilter: string
  statusFilter: string
  isLoading: boolean
  error: string | null
}

const initialState: UserListState = {
  totalUsers: 0,
  pageUsers: 1,
  rowsUsers: 10,
  searchUsers: '',
  roleFilter: 'all',
  statusFilter: 'all',
  isLoading: false,
  error: null,
}

const userListSlice = createSlice({
  name: 'userList',
  initialState,
  reducers: {
    setTotalUsers: (state, action: PayloadAction<number>) => {
      state.totalUsers = action.payload
    },
    setPageUsers: (state, action: PayloadAction<number>) => {
      state.pageUsers = action.payload
    },
    setRowsUsers: (state, action: PayloadAction<number>) => {
      state.rowsUsers = action.payload
    },
    setSearchUsers: (state, action: PayloadAction<string>) => {
      state.searchUsers = action.payload
    },
    setRoleFilter: (state, action: PayloadAction<string>) => {
      state.roleFilter = action.payload
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
    },
    setUserListLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setUserListError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    resetUserListFilters: (state) => {
      state.searchUsers = ''
      state.roleFilter = 'all'
      state.statusFilter = 'all'
      state.pageUsers = 1
    },
  },
})

export const {
  setTotalUsers,
  setPageUsers,
  setRowsUsers,
  setSearchUsers,
  setRoleFilter,
  setStatusFilter,
  setUserListLoading,
  setUserListError,
  resetUserListFilters,
} = userListSlice.actions

export const selectTotalUsers = (state: RootState) => state.userList.totalUsers
export const selectPageUsers = (state: RootState) => state.userList.pageUsers
export const selectRowsUsers = (state: RootState) => state.userList.rowsUsers
export const selectSearchUsers = (state: RootState) => state.userList.searchUsers
export const selectRoleFilter = (state: RootState) => state.userList.roleFilter
export const selectStatusFilter = (state: RootState) => state.userList.statusFilter
export const selectUserListLoading = (state: RootState) => state.userList.isLoading
export const selectUserListError = (state: RootState) => state.userList.error

export default userListSlice.reducer
