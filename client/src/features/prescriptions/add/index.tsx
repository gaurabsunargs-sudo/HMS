import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddPrescription = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Prescription'
        description='This page allows you to add a new prescription.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddPrescription
