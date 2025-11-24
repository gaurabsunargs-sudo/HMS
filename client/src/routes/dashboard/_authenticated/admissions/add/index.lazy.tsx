import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddAdmission from '@/features/admissions/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/admissions/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Admissions List', link: '/dashboard/admissions' },
      { title: 'Add Admission', link: '/dashboard/admissions/add' },
    ])
  )
  return (
    <div>
      <AddAdmission />
    </div>
  )
}
