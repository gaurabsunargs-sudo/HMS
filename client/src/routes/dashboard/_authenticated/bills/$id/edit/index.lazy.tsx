import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditBill from '@/features/bills/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/bills/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Bills List', link: '/dashboard/bills' },
      { title: 'Edit Bill', link: '/dashboard/bills/edit' },
    ])
  )
  return (
    <div>
      <EditBill />
    </div>
  )
}
