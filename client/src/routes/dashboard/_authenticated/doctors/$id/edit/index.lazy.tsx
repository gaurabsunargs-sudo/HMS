import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditDoctor from '@/features/doctors/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/doctors/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Doctor List', link: '/dashboard/doctors' },
      { title: 'Edit Doctor', link: '/dashboard/doctors/edit' },
    ])
  )
  return (
    <div>
      <EditDoctor />
    </div>
  )
}
