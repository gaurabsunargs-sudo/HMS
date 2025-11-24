import { useParams } from '@tanstack/react-router'
import { useUserById } from '@/api/hooks/useUsers'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import UserForm from '../add/user-list-form'

const EditUser = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/users/$id/edit/',
  })
  const { data: user, isLoading } = useUserById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit User'
        description='This page allows you to edit a user.'
      />
      {isLoading ? <Spinner /> : <UserForm updateData={user} />}
    </div>
  )
}

export default EditUser
