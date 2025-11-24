import { ReactNode, useMemo } from 'react'
import Cookies from 'js-cookie'
import { useRouterState } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { NavigationProgress } from '../navigation-progress'
import { ScrollArea } from '../ui/scroll-area'
import { TopNav } from './top-nav'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const defaultOpen = Cookies.get('sidebar:state') !== 'false'

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })

  const isChatPage = useMemo(() => {
    return (
      pathname === '/dashboard/chat' || pathname.startsWith('/dashboard/chat/')
    )
  }, [pathname])

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <NavigationProgress />
        <AppSidebar />
        <div
          id='content'
          className={cn(
            'ml-auto w-full max-w-full',
            'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon))]',
            'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
            'transition-[width] duration-200 ease-linear',
            'flex h-svh flex-col',
            'group-data-[scroll-locked=1]/body:h-full',
            'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
          )}
        >
          <TopNav />
          <ScrollArea className='h-[calc(100svh-60px)]'>
            <div className={isChatPage ? 'p-0' : 'p-4 pb-10'}>{children}</div>
          </ScrollArea>
        </div>
      </SidebarProvider>
    </SearchProvider>
  )
}
