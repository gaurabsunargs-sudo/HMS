import type { ReactNode, Dispatch, SetStateAction } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type {
  NavCollapsible,
  NavItem,
  NavLink,
  NavGroup as NavGroupType,
} from './types'

export interface NavGroupProps extends NavGroupType {
  openAccordionId: string | null
  setOpenAccordionId: Dispatch<SetStateAction<string | null>>
}

export function NavGroup({
  title,
  items,
  openAccordionId,
  setOpenAccordionId,
}: NavGroupProps) {
  const { state } = useSidebar()
  const href = useLocation({ select: (location) => location.href })

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className={cn(
          'text-sidebar-foreground text-xs font-medium tracking-wide uppercase',
          state === 'collapsed' ? 'hidden' : 'mt-2 px-3'
        )}
      >
        {title}
      </SidebarGroupLabel>
      <SidebarMenu
        className={cn('mb-1', state === 'collapsed' ? 'px-2' : 'px-3')}
      >
        {items?.map((item) => {
          const uniqueItemId = `${title}-${item.title}-${item.url || 'group'}`

          if (!item.items) {
            return (
              <div
                key={uniqueItemId}
                className={state === 'collapsed' ? 'mb-1' : ''}
              >
                <SidebarMenuLink item={item} href={href} />
              </div>
            )
          }

          return state === 'collapsed' ? (
            <div key={uniqueItemId} className='mb-1'>
              <SidebarMenuCollapsedDropdown item={item} href={href} />
            </div>
          ) : (
            <SidebarMenuCollapsible
              key={uniqueItemId}
              item={item}
              href={href}
              isOpen={openAccordionId === uniqueItemId}
              onOpenChange={(open) =>
                setOpenAccordionId(open ? uniqueItemId : null)
              }
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge
    variant='secondary'
    className='ml-auto flex h-4 w-4 items-center justify-center rounded-full p-1 text-xs'
  >
    {children}
  </Badge>
)

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  const isActive = isItemActive(href, item.url)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className='text-sidebar-foreground/90 font-normal'
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <item.icon className='text-sidebar-foreground/90 stroke-[2px]' />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({
  item,
  href,
  isOpen,
  onOpenChange,
}: {
  item: NavCollapsible
  href: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { setOpenMobile } = useSidebar()
  const isActive =
    isItemActive(href, item.url) || isAnyChildActive(href, item.items)

  return (
    <Collapsible
      asChild
      open={isOpen}
      onOpenChange={onOpenChange}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className='text-sidebar-foreground/90 font-normal'
            isActive={isActive}
          >
            {item.icon && (
              <item.icon className='text-sidebar-foreground/90 stroke-[2px]' />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight
              className={cn(
                'ml-auto size-3.5 transition-transform duration-200',
                isOpen ? 'rotate-90' : ''
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className='data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden'>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              // Get sibling URLs for smart matching
              const siblingUrls = item.items
                .filter((i) => i.url !== subItem.url && i.url !== undefined)
                .map((i) => i.url as string)
              const isSubActive = isItemActive(href, subItem.url, siblingUrls)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className='text-[13px]'
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && (
                        <subItem.icon className='text-sidebar-foreground/70 size-3.5 stroke-[1.5px]' />
                      )}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) => {
  const isActive =
    isItemActive(href, item.url) || isAnyChildActive(href, item.items)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          tooltip={item.title}
          isActive={isActive}
          className='text-sidebar-foreground/90 font-normal'
        >
          {item.icon && (
            <item.icon className='text-sidebar-foreground stroke-[2px]' />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
          <ChevronRight className='ml-auto size-3.5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='right'
        align='start'
        sideOffset={4}
        className='z-50000000000 min-w-52'
      >
        <DropdownMenuLabel className='text-foreground font-normal'>
          {item.title} {item.badge && `(${item.badge})`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {item.items.map((sub) => {
          // Get sibling URLs for smart matching
          const siblingUrls = item.items
            .filter((i) => i.url !== sub.url && i.url !== undefined)
            .map((i) => i.url as string)
          const isSubActive = isItemActive(href, sub.url, siblingUrls)
          return (
            <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
              <Link
                to={sub.url}
                className={cn(
                  'flex items-center gap-2',
                  isSubActive && 'bg-secondary font-medium'
                )}
              >
                {sub.icon && (
                  <sub.icon className='text-foreground/70 size-3.5 stroke-[1.5px]' />
                )}
                <span className='max-w-52 text-wrap'>{sub.title}</span>
                {sub.badge && (
                  <Badge
                    variant='secondary'
                    className='ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium'
                  >
                    {sub.badge}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function isItemActive(
  href: string,
  itemUrl?: string,
  siblingUrls?: string[]
) {
  if (!itemUrl) return false
  const cleanHref = href.split('?')[0]
  const cleanItemUrl = itemUrl.split('?')[0]

  // Exact match
  if (cleanHref === cleanItemUrl) return true

  // Check if current href matches any sibling route
  // If it does, don't activate this item (use exact match only)
  if (siblingUrls && siblingUrls.length > 0) {
    const matchesSibling = siblingUrls.some(
      (siblingUrl) =>
        cleanHref === siblingUrl || cleanHref.startsWith(siblingUrl + '/')
    )
    if (matchesSibling) return false
  }

  // If no sibling match, use startsWith logic for child routes
  // This allows /dashboard/users to match /dashboard/users/edit/123
  if (
    cleanItemUrl !== '/dashboard' &&
    cleanHref.startsWith(cleanItemUrl + '/')
  ) {
    return true
  }

  return false
}

export function isAnyChildActive(href: string, items?: NavItem[]) {
  if (!items) return false
  const cleanHref = href.split('?')[0]
  return items.some((item) => {
    // Get sibling URLs (all other items in the same group)
    const siblingUrls = items
      .filter((i) => i.url !== item.url && i.url !== undefined)
      .map((i) => i.url as string)

    return isItemActive(cleanHref, item.url, siblingUrls)
  })
}
