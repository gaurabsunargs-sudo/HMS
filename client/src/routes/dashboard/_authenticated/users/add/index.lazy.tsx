import { createLazyFileRoute } from '@tanstack/react-router'
import AddUser from '@/features/users/add'

export const Route = createLazyFileRoute(
  '/dashboard/_authenticated/users/add/'
)({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <AddUser />
    </div>
  )
}
