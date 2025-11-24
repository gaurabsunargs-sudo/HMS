// command-menu.tsx
import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  IconArrowRightDashed,
  IconDeviceLaptop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react'
import getUserRole from '@/lib/get-user-role'
import { useSearch } from '@/context/search-context'
import { useTheme } from '@/context/theme-context'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { getSidebarDataByRole } from '../layout/data/sidebar-data'
import { ScrollArea } from '../ui/scroll-area'

export function CommandCategory() {
  const navigate = useNavigate()
  const { setTheme } = useTheme()

  // Get search context with error handling
  let open = false
  let setOpen: React.Dispatch<React.SetStateAction<boolean>> = () => false

  try {
    const context = useSearch()
    open = context.open
    setOpen = context.setOpen
  } catch (error) {
    console.error('CommandCategory: Failed to get search context', error)
    // Continue with default values
  }
  const { navGroups: sidebarData } = getSidebarDataByRole(getUserRole())

  // Memoize the sidebar data to prevent unnecessary re-renders
  const memoizedSidebarData = React.useMemo(() => sidebarData, [])

  // Memoize the command function to prevent unnecessary re-renders
  const runCommand = React.useCallback(
    (command: () => unknown) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  // Handler for when dialog is closed
  const handleOpenChange = React.useCallback(
    (value: boolean) => {
      setOpen(value)
    },
    [setOpen]
  )

  return (
    <CommandDialog modal open={open} onOpenChange={handleOpenChange}>
      <CommandInput
        placeholder='Type a command or search...'
        onFocus={() => setOpen(true)}
      />
      <CommandList>
        <ScrollArea type='hover' className='h-72 pr-1'>
          <CommandEmpty>No results found.</CommandEmpty>
          {memoizedSidebarData?.map((group) => (
            <CommandGroup key={group.title} heading={group.title}>
              {group?.items?.map((navItem, i) => {
                if (navItem.url)
                  return (
                    <CommandItem
                      key={`${navItem.url}-${i}`}
                      value={navItem.title}
                      onSelect={() => {
                        runCommand(() => navigate({ to: navItem.url }))
                      }}
                    >
                      <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                        <IconArrowRightDashed className='text-muted-foreground/80 size-2' />
                      </div>
                      {navItem.title}
                    </CommandItem>
                  )

                // Safely handle items array that might be undefined
                return (
                  navItem.items?.map((subItem, i) => (
                    <CommandItem
                      key={`${subItem.url}-${i}`}
                      value={subItem.title}
                      onSelect={() => {
                        runCommand(() => navigate({ to: subItem.url }))
                      }}
                    >
                      <div className='mr-2 flex h-4 w-4 items-center justify-center'>
                        <IconArrowRightDashed className='text-muted-foreground/80 size-2' />
                      </div>
                      {subItem.title}
                    </CommandItem>
                  )) || null
                )
              })}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading='Theme'>
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <IconSun /> <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <IconMoon className='scale-90' />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <IconDeviceLaptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </ScrollArea>
      </CommandList>
    </CommandDialog>
  )
}
