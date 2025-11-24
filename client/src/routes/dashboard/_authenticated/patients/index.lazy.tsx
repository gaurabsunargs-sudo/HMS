import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import PatientList from '@/features/patients'

export const Route = createLazyFileRoute('/dashboard/_authenticated/patients/')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Patient List', link: '/dashboard/patients' },
    ])
  )
  return (
    <div>
      <PatientList />
    </div>
  )
}
