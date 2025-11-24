import { Pagination } from './pagination-schema'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  success: boolean
  message: string
  data: Notification[]
  meta: {
    pagination: Pagination
  }
}

export interface CreateNotificationRequest {
  userId: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
}
