import { createLazyFileRoute } from '@tanstack/react-router'
import Profile from '@/features/profile'

export const Route = createLazyFileRoute('/dashboard/_authenticated/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <Profile />
    </div>
  )
}
