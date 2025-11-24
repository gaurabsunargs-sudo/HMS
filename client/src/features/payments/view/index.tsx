import { useParams } from '@tanstack/react-router'
import { usePaymentById } from '@/api/hooks/usePayments'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const ViewPayment = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/payments/$id/',
  })
  const { data: payment, isLoading } = usePaymentById(id)

  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Payment'
        description='This page allows you to edit a payment.'
      />
      {isLoading && !payment && <Spinner />}
      {payment && <ViewData viewData={payment} />}
    </div>
  )
}

export default ViewPayment
