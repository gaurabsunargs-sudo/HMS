import { createLazyFileRoute } from '@tanstack/react-router'
import ViewUser from '@/features/users/view'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/users/$id/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <ViewUser />
    </div>
  )
}
