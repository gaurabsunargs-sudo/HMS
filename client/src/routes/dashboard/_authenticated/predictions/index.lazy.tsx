import { createLazyFileRoute } from '@tanstack/react-router'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppDispatch } from '@/redux/store'
import Predictions from '@/features/predictions'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/predictions/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  const dispatch = useAppDispatch()
  dispatch(
    setBreadcrumb([
      { title: 'Dashboard', link: '/dashboard' },
      { title: 'Predictions List', link: '/dashboard/predictions' },
    ])
  )
  return <Predictions />
}
