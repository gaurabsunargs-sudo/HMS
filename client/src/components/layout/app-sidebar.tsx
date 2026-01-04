import { useState } from 'react'
import { Activity } from 'lucide-react'
import getUserRole from '@/lib/get-user-role'
// Add this import
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { getSidebarDataByRole } from './data/sidebar-data'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)
  const { state } = useSidebar()
  const { navGroups: sidebarData } = getSidebarDataByRole(getUserRole())
  return (
    <Sidebar className='z-49' collapsible='icon' {...props}>
      <SidebarHeader
        className={`${state === 'collapsed' ? 'mb-3' : ''} flex h-[60px]! justify-center border-b border-white/50 pb-2`}
      >
        {state === 'collapsed' ? (
          <div className='bg-gradient-medical flex h-8 w-8 items-center justify-center rounded-lg'>
            <Activity className='h-5 w-5 text-white' />
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            <div>
              <div className='bg-gradient-medical flex h-9 w-9 items-center justify-center rounded-lg'>
                <Activity className='h-6 w-6 text-white' /> 
              </div>
            </div>
            <div>
              <div className='font-semibold'>PulsePoint</div>
              <p className='text-[10px] font-light text-white/80 italic'>
                The Heart of Hospital Operations
              </p>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        {sidebarData?.map((navGroupProps) => (
          <NavGroup
            key={navGroupProps.title}
            {...navGroupProps}
            // Pass the state and setter as props
            openAccordionId={openAccordionId}
            setOpenAccordionId={setOpenAccordionId}
          />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
