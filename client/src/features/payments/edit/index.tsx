import { useParams } from '@tanstack/react-router'
import { usePaymentById } from '@/api/hooks/usePayments'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import AddEditForm from '../add/add-edit-form'

const EditPayment = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/payments/$id/edit/',
  })
  const { data: payment, isLoading } = usePaymentById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit Payment'
        description='This page allows you to edit a payment.'
      />
      {isLoading && !payment && <Spinner />}
      {payment && <AddEditForm payment={payment} isEdit={true} />}
    </div>
  )
}

export default EditPayment
