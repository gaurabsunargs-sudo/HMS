import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddPrescription from '@/features/prescriptions/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/prescriptions/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Prescriptions List', link: '/dashboard/prescriptions' },
      { title: 'Add Prescription', link: '/dashboard/prescriptions/add' },
    ])
  )
  return (
    <div>
      <AddPrescription />
    </div>
  )
}
