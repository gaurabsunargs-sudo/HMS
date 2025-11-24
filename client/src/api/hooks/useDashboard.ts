import { useQuery } from '@tanstack/react-query'
import { DashboardStats, DashboardResponse } from '@/schema/dashboard-schema'
import { api } from '../client'

export const useDashboardStats = () => {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardResponse>('/dashboard/stats')
      return data.data
    },
  })
}

export const useRecentActivities = () => {
  return useQuery<any[], Error>({
    queryKey: ['recentActivities'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/recent-activities')
      return data.data
    },
  })
}

export const useRevenueTrends = ({ period = '7d' }: { period?: string }) => {
  return useQuery<any[], Error>({
    queryKey: ['revenueTrends', period],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/revenue-trends', {
        params: { period },
      })
      return data.data
    },
  })
}
