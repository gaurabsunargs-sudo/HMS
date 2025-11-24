import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditPatient from '@/features/patients/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/patients/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Patient List', link: '/dashboard/patients' },
      { title: 'Update Patient', link: '/dashboard/patients/edit' },
    ])
  )
  return (
    <div>
      <EditPatient />
    </div>
  )
}
