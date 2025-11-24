import {
  LayoutDashboard,
  MessagesSquare,
  ClipboardList,
  Users,
  FileText,
  Package,
  PlusCircle,
  Bed,
  Brain,
  History,
  Notebook,
} from 'lucide-react'
import { SidebarData } from '../types'

export const doctorSidebar: SidebarData = {
  navGroups: [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Chat', url: '/dashboard/chat', icon: MessagesSquare },
      ],
    },

    {
      title: 'Appointments',
      items: [
        {
          title: 'My Appointments',
          url: '/dashboard/appointments',
          icon: ClipboardList,
        },
      ],
    },

    {
      title: 'Patients',
      items: [
        { title: 'My Patients', url: '/dashboard/patients', icon: Users },
      ],
    },

    {
      title: 'Medical Records',
      items: [
        {
          title: 'Records',
          icon: FileText,
          items: [
            {
              title: 'All Records',
              url: '/dashboard/medical-records',
              icon: FileText,
            },
            {
              title: 'Add Record',
              url: '/dashboard/medical-records/add',
              icon: PlusCircle,
            },
          ],
        },
        {
          title: 'Prescriptions',
          icon: Notebook,
          items: [
            {
              title: 'All Prescriptions',
              url: '/dashboard/prescriptions',
              icon: Package,
            },
            {
              title: 'Add Prescription',
              url: '/dashboard/prescriptions/add',
              icon: PlusCircle,
            },
          ],
        },
      ],
    },

    {
      title: 'Hospital Resources',
      items: [{ title: 'Beds', url: '/dashboard/beds', icon: Bed }],
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
