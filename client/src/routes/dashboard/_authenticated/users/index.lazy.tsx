import { createLazyFileRoute } from '@tanstack/react-router'
import UserList from '@/features/users'

export const Route = createLazyFileRoute('/dashboard/_authenticated/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <UserList />
    </div>
  )
}
