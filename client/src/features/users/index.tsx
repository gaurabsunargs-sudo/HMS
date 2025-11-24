import { useEffect } from 'react'
import { setBreadcrumb } from '@/redux/slices/breadcrumbSlice'
import {
  selectPageUsers,
  selectRowsUsers,
  selectSearchUsers,
  setTotalUsers,
} from '@/redux/slices/userListSlice'
import { useAppDispatch, useAppSelector } from '@/redux/store'
import { useUsers } from '@/api/hooks/useUsers'
import PageHeader from '@/components/pageHeader'
import { DataTable } from '@/components/table/TableComponent'
import Pagination from './assets/Pagination'
import TableFilter from './assets/TableFilter'
import { columns } from './assets/def/columns'

const UserList = () => {
  const page = useAppSelector(selectPageUsers)
  const limit = useAppSelector(selectRowsUsers)
  const search = useAppSelector(selectSearchUsers)
  const dispatch = useAppDispatch()

  const {
    data: userListData,
    isLoading,
    isError,
    error,
  } = useUsers({ page, limit, search })

  useEffect(() => {
    dispatch(
      setBreadcrumb([
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'User List', link: '/dashboard/user-list' },
      ])
    )
  }, [])

  useEffect(() => {
    if (userListData?.meta.pagination.total) {
      dispatch(setTotalUsers(userListData?.meta.pagination.total))
    }
  }, [userListData, dispatch])

  if (isError) {
    return <p>Error fetching claims: {error.message}</p>
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <PageHeader
        title='User List'
        description='All user list are found here.'
      />
      <DataTable
        loading={isLoading}
        data={userListData?.data || []}
        columns={columns}
        DataTableToolbar={TableFilter}
        TableFooterCustom={Pagination}
      />
    </div>
  )
}

export default UserList
