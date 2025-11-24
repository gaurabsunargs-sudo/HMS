import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import MedicalRecordList from '@/features/medical-records'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/medical-records/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Medical Records', link: '/dashboard/medical-records' },
    ])
  )
  return (
    <div>
      <MedicalRecordList />
    </div>
  )
}
