import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import PrescriptionList from '@/features/prescriptions'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/prescriptions/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Prescriptions List', link: '/dashboard/prescriptions' },
    ])
  )
  return (
    <div>
      <PrescriptionList />
    </div>
  )
}
