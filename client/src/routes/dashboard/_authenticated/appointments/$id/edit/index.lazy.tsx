import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditAppointment from '@/features/appointments/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/appointments/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Appointment List', link: '/dashboard/appointments' },
      { title: 'Update Appointment', link: '/dashboard/appointments/view' },
    ])
  )
  return (
    <div>
      <EditAppointment />
    </div>
  )
}
