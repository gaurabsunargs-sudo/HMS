import PageHeader from '@/components/pageHeader'
import UserForm from './user-list-form'

const AddUser = () => {
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Add User'
        description='This page allows you to add a new user.'
      />
      <UserForm />
    </div>
  )
}
export default AddUser
