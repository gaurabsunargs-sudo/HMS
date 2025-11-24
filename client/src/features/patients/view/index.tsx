import { useParams } from '@tanstack/react-router'
import { usePatientById } from '@/api/hooks/usePatients'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewPatient = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/patients/$id/',
  })
  const { data: patient, isLoading } = usePatientById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Patient'
        description='This page allows you to edit a patient.'
      />
      {isLoading && !patient && <Spinner />}
      {patient && <ViewData viewData={patient} />}
    </div>
  )
}

export default ViewPatient
