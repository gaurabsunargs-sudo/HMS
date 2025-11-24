import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditPayment from '@/features/payments/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/payments/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Payments List', link: '/dashboard/payments' },
      { title: 'Payments Edit', link: '/dashboard/payments/edit' },
    ])
  )
  return (
    <div>
      <EditPayment />
    </div>
  )
}
