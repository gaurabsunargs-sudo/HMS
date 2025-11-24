import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewPrescription from '@/features/prescriptions/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/prescriptions/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Prescriptions List', link: '/dashboard/prescriptions' },
      { title: 'View Prescription', link: '/dashboard/prescriptions/view' },
    ])
  )
  return (
    <div>
      <ViewPrescription />
    </div>
  )
}
