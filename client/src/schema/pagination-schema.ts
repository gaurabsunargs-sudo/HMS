export interface Pagination {
  pages: number
  total: number
  limit: number
  page: number
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: {
    pagination: Pagination
  }
}
