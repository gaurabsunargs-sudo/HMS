import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewMedicalRecord from '@/features/medical-records/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/medical-records/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Medical Records', link: '/dashboard/medical-records' },
      {
        title: 'View Medical Records',
        link: '/dashboard/medical-records/view',
      },
    ])
  )
  return (
    <div>
      <ViewMedicalRecord />
    </div>
  )
}
