import { useParams } from '@tanstack/react-router'
import { useAdmissionById } from '@/api/hooks/useAdmissions'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewAdmission = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/admissions/$id/',
  })
  const { data: admission, isLoading } = useAdmissionById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Admission'
        description='This page allows you to edit a admission.'
      />
      {isLoading && !admission && <Spinner />}
      {admission && <ViewData viewData={admission} />}
    </div>
  )
}

export default ViewAdmission
