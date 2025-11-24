import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import BillList from '@/features/bills'

export const Route = createLazyFileRoute('/dashboard/_authenticated/bills/')({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Bills List', link: '/dashboard/bills' },
    ])
  )
  return (
    <div>
      <BillList />
    </div>
  )
}
