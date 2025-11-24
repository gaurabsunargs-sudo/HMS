import { useParams } from '@tanstack/react-router'
import { useBillById } from '@/api/hooks/useBills'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewBill = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/bills/$id/',
  })
  const { data: bill, isLoading } = useBillById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Bill'
        description='This page allows you to edit a bill.'
      />
      {isLoading && !bill && <Spinner />}
      {bill && <ViewData viewData={bill} />}
    </div>
  )
}

export default ViewBill
