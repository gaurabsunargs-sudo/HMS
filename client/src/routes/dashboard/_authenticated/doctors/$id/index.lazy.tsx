import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewDoctor from '@/features/doctors/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/doctors/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Doctor List', link: '/dashboard/doctors' },
      { title: 'View Doctor', link: '/dashboard/doctors/view' },
    ])
  )
  return (
    <div>
      <ViewDoctor />
    </div>
  )
}
