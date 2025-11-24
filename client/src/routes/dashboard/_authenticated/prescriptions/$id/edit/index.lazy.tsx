import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditPrescription from '@/features/prescriptions/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/prescriptions/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Prescriptions List', link: '/dashboard/prescriptions' },
      { title: 'Edit Prescription', link: '/dashboard/prescriptions/edit' },
    ])
  )
  return (
    <div>
      <EditPrescription />
    </div>
  )
}
