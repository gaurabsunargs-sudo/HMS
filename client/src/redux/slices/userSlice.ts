import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

interface PaginationState {
  totalUser: number
  pageUser: number
  rowsUser: number
  searchUser: string
  privilege: string
  is_verified: string
}

const initialState: PaginationState = {
  totalUser: 0,
  pageUser: 1,
  rowsUser: 10,
  searchUser: '',
  privilege: 'all',
  is_verified: 'all',
}

const UserSlice = createSlice({
  name: 'UserPagination',
  initialState,
  reducers: {
    setTotalUser: (state, action: PayloadAction<number>) => {
      state.totalUser = action.payload
    },
    setPageUser: (state, action: PayloadAction<number>) => {
      state.pageUser = action.payload
    },
    setRowsUser: (state, action: PayloadAction<number>) => {
      state.rowsUser = action.payload
    },
    setSearchUser: (state, action: PayloadAction<string>) => {
      state.searchUser = action.payload
    },
    setPrivilege: (state, action: PayloadAction<string>) => {
      state.privilege = action.payload
    },
    setIsVerified: (state, action: PayloadAction<string>) => {
      state.is_verified = action.payload
    },
  },
})

export const {
  setTotalUser,
  setPageUser,
  setRowsUser,
  setSearchUser,
  setPrivilege,
  setIsVerified,
} = UserSlice.actions

export const selectTotalUser = (state: RootState) => state.user.totalUser
export const selectPageUser = (state: RootState) => state.user.pageUser
export const selectRowsUser = (state: RootState) => state.user.rowsUser
export const selectSearchUser = (state: RootState) => state.user.searchUser
export const selectPrivilege = (state: RootState) => state.user.privilege
export const selectIsVerified = (state: RootState) => state.user.is_verified

export default UserSlice.reducer
