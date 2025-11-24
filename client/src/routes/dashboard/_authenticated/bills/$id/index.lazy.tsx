import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewBill from '@/features/bills/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/bills/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Bills List', link: '/dashboard/bills' },
      { title: 'View Bill', link: '/dashboard/bills/view' },
    ])
  )
  return (
    <div>
      <ViewBill />
    </div>
  )
}
