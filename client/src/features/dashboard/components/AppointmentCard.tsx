import { Users } from 'lucide-react'

const AppointmentCard = ({ appointment }: { appointment: any }) => (
  <div className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-4 transition-colors'>
    <div className='flex items-center space-x-3'>
      <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full'>
        <Users className='text-primary h-5 w-5' />
      </div>
      <div>
        <p className='font-medium'>
          {appointment.patient?.user?.firstName}{' '}
          {appointment.patient?.user?.lastName}
        </p>
        <p className='text-muted-foreground text-sm'>
          Dr. {appointment.doctor?.user?.firstName}{' '}
          {appointment.doctor?.user?.lastName}
        </p>
      </div>
    </div>
    <div className='text-right'>
      <p className='text-sm font-medium'>
        {new Date(appointment.dateTime).toLocaleDateString()}
      </p>
      <p className='text-muted-foreground text-xs'>
        {new Date(appointment.dateTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>
    </div>
  </div>
)

export default AppointmentCard
