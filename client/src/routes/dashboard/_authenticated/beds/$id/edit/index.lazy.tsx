import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import EditBed from '@/features/beds/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/beds/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Beds List', link: '/dashboard/beds' },
      { title: 'Edit Bed', link: '/dashboard/beds/edit' },
    ])
  )
  return (
    <div>
      <EditBed />
    </div>
  )
}
