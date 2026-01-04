export interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number
  todayAppointments: number
  occupiedBeds: number
  totalBeds: number
  pendingBills: number
  totalMedicalRecords?: number
  recentAppointments: {

    id: string
    patient: {
      user: {
        firstName: string
        lastName: string
      }
    }
    doctor: {
      user: {
        firstName: string
        lastName: string
      }
    }
    dateTime: string
    status: string
  }[]
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
  departmentStats: {
    department: string
    patientCount: number
    revenue: number
  }[]
}

export interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardStats
}
