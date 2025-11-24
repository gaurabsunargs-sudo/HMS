import { useParams } from '@tanstack/react-router'
import { useBedById } from '@/api/hooks/useBeds'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewBed = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/beds/$id/',
  })
  const { data: bed, isLoading } = useBedById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Bed'
        description='This page allows you to edit a bed.'
      />
      {isLoading && !bed && <Spinner />}
      {bed && <ViewData viewData={bed} />}
    </div>
  )
}

export default ViewBed
