import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import BedList from '@/features/beds'

export const Route = createLazyFileRoute('/dashboard/_authenticated/beds/')({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Beds List', link: '/dashboard/beds' },
    ])
  )
  return (
    <div>
      <BedList />
    </div>
  )
}
