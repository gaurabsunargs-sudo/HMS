import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BreadcrumbItem {
  title: string
  link: string
}

interface BreadcrumbState {
  breadcrumb: BreadcrumbItem[]
}

const initialState: BreadcrumbState = {
  breadcrumb: [],
}

const breadcrumbSlice = createSlice({
  name: 'breadcrumb',
  initialState,
  reducers: {
    setBreadcrumb: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      const uniqueItems = action.payload.filter(
        (item, index, self) =>
          index === self.findIndex((b) => b.title === item.title)
      )
      state.breadcrumb = uniqueItems
    },

    pushBreadcrumb: (state, action: PayloadAction<BreadcrumbItem>) => {
      const exists = state.breadcrumb.some(
        (item) => item.title === action.payload.title
      )
      if (!exists) {
        state.breadcrumb.push(action.payload)
      }
    },

    removeLastBreadcrumb: (state) => {
      state.breadcrumb.pop()
    },

    clearBreadcrumbs: (state) => {
      state.breadcrumb = []
    },
  },
})

export const {
  setBreadcrumb,
  pushBreadcrumb,
  removeLastBreadcrumb,
  clearBreadcrumbs,
} = breadcrumbSlice.actions

export const selectBreadcrumb = (state: { breadcrumb: BreadcrumbState }) =>
  state.breadcrumb.breadcrumb

export default breadcrumbSlice.reducer
