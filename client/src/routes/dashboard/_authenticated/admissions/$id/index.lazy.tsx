import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewAdmission from '@/features/admissions/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/admissions/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Admissions List', link: '/dashboard/admissions' },
      { title: 'View Admission', link: '/dashboard/admissions/view' },
    ])
  )
  return (
    <div>
      <ViewAdmission />
    </div>
  )
}
