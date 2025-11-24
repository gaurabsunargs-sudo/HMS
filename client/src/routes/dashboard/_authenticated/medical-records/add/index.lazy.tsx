import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddMedicalRecord from '@/features/medical-records/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/medical-records/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Medical Records', link: '/dashboard/medical-records' },
      { title: 'Add Medical Records', link: '/dashboard/medical-records/add' },
    ])
  )
  return (
    <div>
      <AddMedicalRecord />
    </div>
  )
}
