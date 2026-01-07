import { useParams } from '@tanstack/react-router'
import { usePaymentById } from '@/api/hooks/usePayments'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewPayment = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/payments/$id/',
  })
  const { data, isLoading } = usePaymentById(id)

  console.log(data)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='View Payment'
        description='This page allows you to view a payment.'
      />
      {isLoading && !data && <Spinner />}
      {data && <ViewData viewData={data} />}
    </div>
  )
}

export default ViewPayment
