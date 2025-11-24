import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import ViewBed from '@/features/beds/view'

export const Route = createLazyFileRoute('/dashboard/_authenticated/beds/$id/')(
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
      { title: 'View Bed', link: '/dashboard/beds/view' },
    ])
  )
  return (
    <div>
      <ViewBed />
    </div>
  )
}
