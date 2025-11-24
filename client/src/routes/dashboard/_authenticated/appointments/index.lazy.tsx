import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AppointmentList from '@/features/appointments'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/appointments/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Appointment List', link: '/dashboard/appointments' },
    ])
  )
  return (
    <div>
      <AppointmentList />
    </div>
  )
}
