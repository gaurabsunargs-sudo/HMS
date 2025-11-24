import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddAppointment from '@/features/appointments/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/appointments/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Appointment List', link: '/dashboard/appointments' },
      { title: 'Add Appointment', link: '/dashboard/appointments/add' },
    ])
  )
  return (
    <div>
      <AddAppointment />
    </div>
  )
}
