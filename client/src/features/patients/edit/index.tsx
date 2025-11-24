import { useParams } from '@tanstack/react-router'
import { usePatientById } from '@/api/hooks/usePatients'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import PatientEnrollmentForm from '../add/patient-enrollment-form'

const EditPatient = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/patients/$id/edit/',
  })
  const { data: patient, isLoading } = usePatientById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Patient'
        description='This page allows you to edit a patient.'
      />
      {isLoading && !patient && <Spinner />}
      {patient && <PatientEnrollmentForm patient={patient} isEdit={true} />}
    </div>
  )
}

export default EditPatient
