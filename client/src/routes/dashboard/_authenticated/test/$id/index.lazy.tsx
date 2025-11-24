import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/dashboard/_authenticated/test/$id/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/test/$id/"!</div>
}
