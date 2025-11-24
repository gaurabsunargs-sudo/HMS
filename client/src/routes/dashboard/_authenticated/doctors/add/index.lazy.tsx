import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddDoctor from '@/features/doctors/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/doctors/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Doctor List', link: '/dashboard/doctors' },
      { title: 'Add Doctor', link: '/dashboard/doctors/add' },
    ])
  )
  return (
    <div>
      <AddDoctor />
    </div>
  )
}
