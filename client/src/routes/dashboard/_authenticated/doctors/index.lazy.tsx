import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import Doctors from '@/features/doctors'

export const Route = createLazyFileRoute('/dashboard/_authenticated/doctors/')({
  path: '/admin/doctors',
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Doctor List', link: '/dashboard/doctors' },
    ])
  )
  return (
    <div>
      <Doctors />
    </div>
  )
}
