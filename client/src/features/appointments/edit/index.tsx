import { useParams } from '@tanstack/react-router'
import { useAppointmentById } from '@/api/hooks/useAppointments'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import AddEditForm from '../add/add-edit-form'

const EditAppointment = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/appointments/$id/edit/',
  })
  const { data: appointment, isLoading } = useAppointmentById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Appointment'
        description='This page allows you to edit a appointment.'
      />
      {isLoading && !appointment && <Spinner />}
      {appointment && <AddEditForm appointment={appointment} isEdit={true} />}
    </div>
  )
}

export default EditAppointment
