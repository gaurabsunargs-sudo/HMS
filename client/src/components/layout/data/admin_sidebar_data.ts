import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  UserPlus,
  Stethoscope,
  BriefcaseMedical,
  ClipboardList,
  FileText,
  Package,
  Building2,
  Bed,
  Receipt,
  CreditCard,
  PlusCircle,
  Brain,
} from 'lucide-react'
import { SidebarData } from '../types'

export const adminSidebar: SidebarData = {
  navGroups: [
    {
      title: 'Main',
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
        { title: 'Chat', url: '/dashboard/chat', icon: MessagesSquare },
      ],
    },

    {
      title: 'Hospital Operations',
      items: [
        {
          title: 'Users',
          icon: Users,
          items: [
            { title: 'All Users', url: '/dashboard/users', icon: Users },
            {
              title: 'Add Users',
              url: '/dashboard/users/add',
              icon: UserPlus,
            },
          ],
        },
        {
          title: 'Patients',
          icon: Users,
          items: [
            { title: 'All Patients', url: '/dashboard/patients', icon: Users },
            {
              title: 'Add Patient',
              url: '/dashboard/patients/add',
              icon: UserPlus,
            },
          ],
        },
        {
          title: 'Doctors',
          icon: Stethoscope,
          items: [
            {
              title: 'All Doctors',
              url: '/dashboard/doctors',
              icon: Stethoscope,
            },
            {
              title: 'Add Doctor',
              url: '/dashboard/doctors/add',
              icon: BriefcaseMedical,
            },
          ],
        },
        {
          title: 'Appointments',
          icon: ClipboardList,
          items: [
            {
              title: 'All Appointments',
              url: '/dashboard/appointments',
              icon: ClipboardList,
            },
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
      ],
    },

    {
      title: 'Hospital Management',
      items: [
        { title: 'Admissions', url: '/dashboard/admissions', icon: Building2 },
        { title: 'Beds', url: '/dashboard/beds', icon: Bed },
      ],
    },

    {
      title: 'Financial Management',
      items: [
        {
          title: 'Bills',
          icon: Receipt,
          items: [
            { title: 'All Bills', url: '/dashboard/bills', icon: Receipt },
            {
              title: 'Add Bill',
              url: '/dashboard/bills/add',
              icon: PlusCircle,
            },
          ],
        },
        {
          title: 'Payments',
          icon: CreditCard,
          items: [
            {
              title: 'All Payments',
              url: '/dashboard/payments',
              icon: CreditCard,
            },
            {
              title: 'Add Payment',
              url: '/dashboard/payments/add',
              icon: PlusCircle,
            },
          ],
        },
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
