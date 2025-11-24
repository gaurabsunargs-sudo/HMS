import { useQuery } from '@tanstack/react-query'
import { api } from '../client'

export interface PublicStats {
  totalPatients: number
  totalDoctors: number
  yearsOfService: number
  emergencyResponse: string
}

export interface PublicStatsResponse {
  success: boolean
  message: string
  data: PublicStats
}

export const usePublicStats = () => {
  return useQuery<PublicStats, Error>({
    queryKey: ['publicStats'],
    queryFn: async () => {
      try {
        // Try to get stats from dashboard endpoint first
        const { data } = await api.get<PublicStatsResponse>('/dashboard/stats')
        if (data.success) {
          return {
            totalPatients: data.data.totalPatients,
            totalDoctors: data.data.totalDoctors,
            yearsOfService: 2, // Static value for years of service
            emergencyResponse: '24/7', // Static value for emergency response
          }
        }
        throw new Error('Failed to fetch stats')
      } catch (error) {
        // Fallback: fetch counts from individual endpoints
        try {
          const [patientsResponse, doctorsResponse] = await Promise.all([
            api.get('/patients', { params: { limit: 1 } }),
            api.get('/doctors/public', { params: { limit: 1 } }),
          ])

          const patientCount = patientsResponse.data?.total || 0
          const doctorCount = doctorsResponse.data?.total || 0

          return {
            totalPatients: patientCount,
            totalDoctors: doctorCount,
            yearsOfService: 2,
            emergencyResponse: '24/7',
          }
        } catch (fallbackError) {
          // Return default values if all requests fail
          console.warn(
            'Failed to fetch dynamic stats, using defaults:',
            fallbackError
          )
          return {
            totalPatients: 50000,
            totalDoctors: 200,
            yearsOfService: 2,
            emergencyResponse: '24/7',
          }
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch on window focus for public stats
  })
}
