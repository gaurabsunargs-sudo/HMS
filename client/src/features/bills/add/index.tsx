import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddBill = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Bill'
        description='This page allows you to add a new bill.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddBill
