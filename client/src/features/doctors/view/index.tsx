import { useParams } from '@tanstack/react-router'
import { useDoctorById } from '@/api/hooks/useDoctors'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewDoctor = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/doctors/$id/',
  })
  const { data: doctor, isLoading } = useDoctorById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Doctor'
        description='This page allows you to edit a doctor.'
      />
      {isLoading && !doctor && <Spinner />}
      {doctor && <ViewData viewData={doctor} />}
    </div>
  )
}

export default ViewDoctor
