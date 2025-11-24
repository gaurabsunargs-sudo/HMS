import { Fragment } from 'react'
import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type BreadcrumbItemProps = {
  title: string
  link: string
}

export function CustomBreadcrumb({
  items,
  showDashboardIcon = false,
}: {
  items: BreadcrumbItemProps[]
  showDashboardIcon?: Boolean
}) {
  const MAX_ITEMS = 4

  if (items.length === 0) return null

  if (items.length === 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList className='!flex items-center!'>
          {showDashboardIcon && <Home size={17} />}
          <BreadcrumbItem>
            <BreadcrumbPage className='text-foreground cursor-default text-sm font-normal'>
              {items[0].title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const shouldCollapse = items.length > MAX_ITEMS

  const visibleItems = shouldCollapse
    ? [items[0], items[items.length - 2], items[items.length - 1]]
    : items

  const hiddenItems = shouldCollapse ? items.slice(1, items.length - 2) : []

  return (
    <Breadcrumb>
      <BreadcrumbList className='!flex items-center!'>
        {visibleItems.map((item, index) => (
          <Fragment key={item.title}>
            {index === 0 && (
              <>
                {showDashboardIcon && <Home size={17} />}
                <BreadcrumbItem>
                  <Link
                    className='text-muted-foreground hover:text-primary text-sm font-normal text-nowrap hover:underline'
                    to={item.link}
                  >
                    {item.title}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='text-muted-foreground text-sm font-normal' />
              </>
            )}

            {index === 1 && shouldCollapse && (
              <>
                <BreadcrumbItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger className='flex items-center gap-1'>
                      <span>...</span>
                      <span className='sr-only'>Toggle menu</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start'>
                      {hiddenItems.map((hiddenItem) => (
                        <DropdownMenuItem key={hiddenItem.title}>
                          <Link
                            className='text-muted-foreground hover:text-primary text-sm font-normal text-nowrap hover:underline'
                            to={hiddenItem.link}
                          >
                            {hiddenItem.title}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='text-muted-foreground text-sm font-normal' />
              </>
            )}

            {index > 0 && index < visibleItems.length - 1 && (
              <>
                <BreadcrumbItem>
                  <Link
                    className='text-muted-foreground hover:text-primary text-sm font-normal text-nowrap hover:underline'
                    to={item.link}
                  >
                    {item.title}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='text-muted-foreground text-sm font-normal' />
              </>
            )}

            {index === visibleItems.length - 1 && (
              <BreadcrumbPage className='text-foreground cursor-default text-sm font-normal text-nowrap'>
                {item.title}
              </BreadcrumbPage>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
