import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import PaymentList from '@/features/payments'

export const Route = createLazyFileRoute('/dashboard/_authenticated/payments/')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Payments List', link: '/dashboard/payments' },
    ])
  )

  return (
    <div>
      <PaymentList />
    </div>
  )
}
