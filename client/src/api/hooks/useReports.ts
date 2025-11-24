import { useQuery, useMutation } from '@tanstack/react-query'
import { ReportResponse, GenerateReportRequest } from '@/schema/reports-schema'
import { api } from '../client'

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (reportData: GenerateReportRequest) => 
      api.post<ReportResponse>('/reports/generate', reportData),
  })
}

export const usePatientReports = ({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) => {
  return useQuery<any, Error>({
    queryKey: ['patientReports', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/reports/patients', {
        params: { startDate, endDate },
      })
      return data
    },
    enabled: !!startDate && !!endDate,
  })
}

export const useRevenueReports = ({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) => {
  return useQuery<any, Error>({
    queryKey: ['revenueReports', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/reports/revenue', {
        params: { startDate, endDate },
      })
      return data
    },
    enabled: !!startDate && !!endDate,
  })
}

export const useDoctorPerformanceReports = ({ doctorId }: { doctorId?: string }) => {
  return useQuery<any, Error>({
    queryKey: ['doctorPerformanceReports', doctorId],
    queryFn: async () => {
      const { data } = await api.get('/reports/doctor-performance', {
        params: { doctorId },
      })
      return data
    },
    enabled: !!doctorId,
  })
}
