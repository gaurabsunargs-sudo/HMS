import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddBed = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Bed'
        description='This page allows you to add a new bed.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddBed
