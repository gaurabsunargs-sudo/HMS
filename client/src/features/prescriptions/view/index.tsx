import { useParams } from '@tanstack/react-router'
import { usePrescriptionById } from '@/api/hooks/usePrescriptions'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewPrescription = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/prescriptions/$id/',
  })
  const { data: prescription, isLoading } = usePrescriptionById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Prescription'
        description='This page allows you to edit a prescription.'
      />
      {isLoading && !prescription && <Spinner />}
      {prescription && <ViewData viewData={prescription} />}
    </div>
  )
}

export default ViewPrescription
