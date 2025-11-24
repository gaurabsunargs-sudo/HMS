import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddPayment from '@/features/payments/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/payments/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Payments Add', link: '/dashboard/payments/add' },
    ])
  )

  return (
    <div>
      <AddPayment />
    </div>
  )
}
