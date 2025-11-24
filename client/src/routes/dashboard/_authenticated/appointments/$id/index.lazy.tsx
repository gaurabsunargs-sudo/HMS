import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewAppointment from '@/features/appointments/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/appointments/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Appointment List', link: '/dashboard/appointments' },
      { title: 'View Appointment', link: '/dashboard/appointments/view' },
    ])
  )
  return (
    <div>
      <ViewAppointment />
    </div>
  )
}
