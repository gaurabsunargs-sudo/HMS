import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddPayment = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Payment'
        description='This page allows you to add a new payment.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddPayment
