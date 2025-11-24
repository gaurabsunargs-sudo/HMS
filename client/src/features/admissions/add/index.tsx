import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddAdmission = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Admission'
        description='This page allows you to add a new admission.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddAdmission
