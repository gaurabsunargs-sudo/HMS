import { createLazyFileRoute } from '@tanstack/react-router'
import Home from '@/features/user-side/home'

export const Route = createLazyFileRoute('/(home)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Home />
}
