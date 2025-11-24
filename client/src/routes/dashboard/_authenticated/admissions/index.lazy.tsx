import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AdmissionList from '@/features/admissions'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/admissions/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Admissions List', link: '/dashboard/admissions' },
    ])
  )
  return (
    <div>
      <AdmissionList />
    </div>
  )
}
