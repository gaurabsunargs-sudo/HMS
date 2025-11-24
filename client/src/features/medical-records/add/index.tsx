import PageHeader from '@/components/pageHeader'
import AddEditForm from './add-edit-form'

const AddMedicalRecord = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add MedicalRecord'
        description='This page allows you to add a new medicalRecord.'
      />

      <AddEditForm />
    </div>
  )
}

export default AddMedicalRecord
