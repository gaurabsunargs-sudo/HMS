import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewPayment from '@/features/payments/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/payments/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Payments List', link: '/dashboard/payments' },
      { title: 'Payments View', link: '/dashboard/payments/view' },
    ])
  )
  return (
    <div>
      <ViewPayment />
    </div>
  )
}
