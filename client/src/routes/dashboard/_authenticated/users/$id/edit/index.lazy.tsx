import { createLazyFileRoute } from '@tanstack/react-router'
import EditUser from '@/features/users/edit'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/users/$id/edit/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <EditUser />
    </div>
  )
}
