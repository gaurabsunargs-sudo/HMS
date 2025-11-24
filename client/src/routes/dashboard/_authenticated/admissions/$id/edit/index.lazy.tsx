import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditAdmission from '@/features/admissions/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/admissions/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Admissions List', link: '/dashboard/admissions' },
      { title: 'Edit Admission', link: '/dashboard/admissions/edit' },
    ])
  )
  return (
    <div>
      <EditAdmission />
    </div>
  )
}
