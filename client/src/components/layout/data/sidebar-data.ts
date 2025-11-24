import { SidebarData } from '../types'
import { adminSidebar } from './admin_sidebar_data'
import { doctorSidebar } from './doctor_sidebar_data'
import { patientSidebar } from './patient_sidebar_data'

export function getSidebarDataByRole(role: string): SidebarData {
  switch (role) {
    case 'admin':
      return adminSidebar
    case 'doctor':
      return doctorSidebar
    case 'patient':
      return patientSidebar
    default:
      return { navGroups: [] }
  }
}
