import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/_authenticated/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/_authenticated/reports/"!</div>
}
