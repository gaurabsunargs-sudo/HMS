import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditMedicalRecord from '@/features/medical-records/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/medical-records/$id/edit/'
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
        title: 'Edit Medical Records',
        link: '/dashboard/medical-records/edit',
      },
    ])
  )
  return (
    <div>
      <EditMedicalRecord />
    </div>
  )
}
