import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddBill from '@/features/bills/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/bills/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Bills List', link: '/dashboard/bills' },
      { title: 'Add Bill', link: '/dashboard/bills/add' },
    ])
  )
  return (
    <div>
      <AddBill />
    </div>
  )
}
