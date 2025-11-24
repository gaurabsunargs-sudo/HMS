import Cookies from 'js-cookie'
import { Outlet, redirect, createFileRoute } from '@tanstack/react-router'
import { decryptData } from '@/lib/encryptionUtils'
import { AppLayout } from '@/components/layout/app-layout'

export const Route = createFileRoute('/dashboard/_authenticated')({
  beforeLoad: async () => {
    const userData = decryptData(Cookies.get('hms-user'))
    if (!userData.id) {
      throw redirect({
        to: '/sign-in',
        search: {
          redirect: window.location.pathname,
        },
      })
    }

    return { userData }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
