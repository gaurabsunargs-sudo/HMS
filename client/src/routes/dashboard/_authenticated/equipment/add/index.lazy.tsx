import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/_authenticated/equipment/add/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/add/"!</div>
}
