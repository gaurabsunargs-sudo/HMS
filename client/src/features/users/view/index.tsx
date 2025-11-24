import { useParams } from '@tanstack/react-router'
import { useUserById } from '@/api/hooks/useUsers'
import Spinner from '@/components/ui/Spinner'
import PageHeader from '@/components/pageHeader'
import ViewData from './view-data'

const EditUser = () => {
  const { id } = useParams({
    from: '/dashboard/_authenticated/users/$id/',
  })
  const { data: user, isLoading } = useUserById(id)
  return (
    <div className='flex flex-col gap-4'>
      <PageHeader
        title='Edit User'
        description='This page allows you to edit a user.'
      />
      {isLoading ? <Spinner /> : <ViewData viewData={user} />}
    </div>
  )
}

export default EditUser
