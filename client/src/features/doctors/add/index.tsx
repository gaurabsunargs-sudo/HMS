import PageHeader from '@/components/pageHeader'
import DoctorRegisterForm from './doctor-register-form'

const AddDoctor = () => {
  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Doctor'
        description='This page allows you to add a new doctor.'
      />

      <DoctorRegisterForm />
    </div>
  )
}

export default AddDoctor
