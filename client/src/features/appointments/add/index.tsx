import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

interface AddAppointmentProps {
  preSelectedDoctorId?: string
}

const AddAppointment = ({ preSelectedDoctorId }: AddAppointmentProps) => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Appointment'
        description='This page allows you to add a new appointment.'
      />

      <AddEditForm preSelectedDoctorId={preSelectedDoctorId} />
    </div>
  )
}

export default AddAppointment
