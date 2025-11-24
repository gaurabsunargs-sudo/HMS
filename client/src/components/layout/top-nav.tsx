import { selectBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import { useAppSelector } from '@/redux/store'
import { ProfileDropdown } from '../profile-dropdown'
import { Search } from '../search'
import { ThemeToggle } from '../theme-switch'
import { CustomBreadcrumb } from './bread-crumb'
import { FullscreenToggle } from './fullscreen-toggle'
import { Header } from './header'
import { NotificationIcon } from './notification-icon'

export function TopNav() {
  const breadcrumbs = useAppSelector(selectBreadcrumb)

  return (
    <div className='sticky top-0 z-50 shadow-sm'>
      <Header>
        <CustomBreadcrumb items={breadcrumbs} />

        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <div className='flex gap-1.5'>
            <NotificationIcon />
            <FullscreenToggle />
            <ThemeToggle />
          </div>
          <ProfileDropdown />
        </div>
      </Header>
    </div>
  )
}
