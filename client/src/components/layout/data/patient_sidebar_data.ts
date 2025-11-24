import {
  LayoutDashboard,
  MessagesSquare,
  Shield,
  Users,
  UserPlus,
  ClipboardList,
  FileText,
  Package,
  Building2,
  Receipt,
  CreditCard,
  Brain,
  History,
} from 'lucide-react'
import { SidebarData } from '../types'

export const patientSidebar: SidebarData = {
  navGroups: [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Chat', url: '/dashboard/chat', icon: MessagesSquare },
        { title: 'My Profile', url: '/dashboard/profile', icon: Shield },
      ],
    },

    {
      title: 'Doctors',
      items: [
        { title: 'Available Doctors', url: '/dashboard/doctors', icon: Users },
      ],
    },

    {
      title: 'Appointments',
      items: [
        {
          title: 'Book Appointment',
          url: '/dashboard/appointments/add',
          icon: UserPlus,
        },
        {
          title: 'My Appointments',
          url: '/dashboard/appointments',
          icon: ClipboardList,
        },
      ],
    },

    {
      title: 'Medical Information',
      items: [
        {
          title: 'Records',
          icon: FileText, // Sub-accordion icon
          items: [
            {
              title: 'Medical Records',
              url: '/dashboard/medical-records',
              icon: FileText,
            },
            {
              title: 'Prescriptions',
              url: '/dashboard/prescriptions',
              icon: Package,
            },
          ],
        },
        { title: 'Admissions', url: '/dashboard/admissions', icon: Building2 },
      ],
    },

    {
      title: 'Financial',
      items: [
        { title: 'Bills', url: '/dashboard/bills', icon: Receipt },
        { title: 'Payments', url: '/dashboard/payments', icon: CreditCard },
      ],
    },

    {
      title: 'AI Assistance',
      items: [
        {
          title: 'Disease Prediction',
          url: '/dashboard/predictions',
          icon: Brain,
        },
      ],
    },
  ],
}
