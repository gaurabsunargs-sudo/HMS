export interface ReportResponse {
  success: boolean
  message: string
  data: {
    reportId: string
    downloadUrl: string
  }
}

export interface GenerateReportRequest {
  reportType: 'PATIENT' | 'REVENUE' | 'APPOINTMENT' | 'DOCTOR_PERFORMANCE' | 'INVENTORY'
  startDate: string
  endDate: string
  filters?: {
    doctorId?: string
    patientId?: string
    department?: string
    paymentStatus?: string
  }
  format: 'PDF' | 'EXCEL' | 'CSV'
}
