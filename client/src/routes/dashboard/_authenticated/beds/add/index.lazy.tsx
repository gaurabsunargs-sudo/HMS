import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import AddBed from '@/features/beds/add'

export const Route = createLazyFileRoute('/dashboard/_authenticated/beds/add/')(
  {
    component: RouteComponent,
  }
)

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Beds List', link: '/dashboard/beds' },
      { title: 'Add Bed', link: '/dashboard/beds/add' },
    ])
  )
  return (
    <div>
      <AddBed />
    </div>
  )
}
