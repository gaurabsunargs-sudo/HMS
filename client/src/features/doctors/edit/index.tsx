import { useParams } from '@tanstack/react-router'
import { useDoctorById } from '@/api/hooks/useDoctors'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import DoctorEnrollmentForm from '../add/doctor-enrollment-form'

const EditDoctor = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/doctors/$id/edit/',
  })
  const { data: doctor, isLoading } = useDoctorById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Doctor'
        description='This page allows you to edit a doctor.'
      />
      {isLoading && !doctor && <Spinner />}
      {doctor && <DoctorEnrollmentForm doctor={doctor} isEdit={true} />}
    </div>
  )
}

export default EditDoctor
