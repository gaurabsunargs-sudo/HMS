import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewPatient from '@/features/patients/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/patients/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Patient List', link: '/dashboard/patients' },
      { title: 'Single Patient', link: '/dashboard/patientsview' },
    ])
  )
  return (
    <div>
      <ViewPatient />
    </div>
  )
}
