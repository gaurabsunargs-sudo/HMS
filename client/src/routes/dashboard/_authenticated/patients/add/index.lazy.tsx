import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddPatient from '@/features/patients/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/patients/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Patient List', link: '/dashboard/patients' },
      { title: 'Add Patient', link: '/dashboard/patients/add' },
    ])
  )
  return (
    <div>
      <AddPatient />
    </div>
  )
}
