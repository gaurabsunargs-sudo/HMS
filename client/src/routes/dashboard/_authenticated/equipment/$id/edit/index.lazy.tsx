import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/_authenticated/equipment/$id/edit/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/$id/edit/"!</div>
}
