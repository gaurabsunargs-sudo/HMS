import { useParams } from '@tanstack/react-router'
import { useMedicalRecordById } from '@/api/hooks/useMedicalRecords'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewMedicalRecord = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/medical-records/$id/',
  })
  const { data: medicalRecord, isLoading } = useMedicalRecordById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit MedicalRecord'
        description='This page allows you to edit a medicalRecord.'
      />
      {isLoading && !medicalRecord && <Spinner />}
      {medicalRecord && <ViewData viewData={medicalRecord} />}
    </div>
  )
}

export default ViewMedicalRecord
