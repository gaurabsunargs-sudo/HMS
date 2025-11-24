import { useParams } from '@tanstack/react-router'
import { useAppointmentById } from '@/api/hooks/useAppointments'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewAppointment = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/appointments/$id/',
  })
  const { data: appointment, isLoading } = useAppointmentById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Appointment'
        description='This page allows you to edit a appointment.'
      />
      {isLoading && !appointment && <Spinner />}
      {appointment && <ViewData viewData={appointment} />}
    </div>
  )
}

export default ViewAppointment
