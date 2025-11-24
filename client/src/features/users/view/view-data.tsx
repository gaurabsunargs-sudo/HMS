import { User } from '@/schema/users-schema'
import {
  Calendar,
  Mail,
  UserIcon,
  Shield,
  Hash,
  UserCheck,
  UserCog,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const ViewData = ({ viewData }: { viewData: User }) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No user data available</p>
      </div>
    )
  }

  const {
    id,
    username,
    email,
    firstName,
    middleName,
    lastName,
    profile,
    role,
    isActive,
    createdAt,
    updatedAt,
    doctor,
    patient,
    adminProfile,
  } = viewData

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        {/* User Profile Card */}
        <Card className='md:col-span-2'>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-2xl'>
                  {firstName} {middleName && `${middleName} `}
                  {lastName}
                </CardTitle>
                <CardDescription>User Information</CardDescription>
              </div>
              <div className='flex items-center space-x-2'>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={
                    isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant='outline' className='flex items-center'>
                  <Shield className='mr-1 h-3 w-3' />
                  {role}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Username
                    </p>
                    <p className='font-semibold'>{username}</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>Email</p>
                    <p className='font-semibold'>{email}</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>User ID</p>
                    <p className='text-sm font-semibold'>{id}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='flex items-start'>
                  <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Created At
                    </p>
                    <p className='font-semibold'>{formatDate(createdAt)}</p>
                  </div>
                </div>

                <div className='flex items-start'>
                  <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      Updated At
                    </p>
                    <p className='font-semibold'>{formatDate(updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Specific Card */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              {role === 'ADMIN' ? (
                <>
                  <UserCog className='mr-2 h-5 w-5' />
                  Admin Profile
                </>
              ) : role === 'DOCTOR' ? (
                <>
                  <UserCheck className='mr-2 h-5 w-5' />
                  Doctor Profile
                </>
              ) : (
                <>
                  <UserIcon className='mr-2 h-5 w-5' />
                  Patient Profile
                </>
              )}
            </CardTitle>
            <CardDescription>{role} specific information</CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            {role === 'ADMIN' && adminProfile ? (
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Employee ID
                  </p>
                  <p className='font-semibold'>{adminProfile.employeeId}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Admin Profile ID
                  </p>
                  <p className='text-sm font-semibold'>{adminProfile.id}</p>
                </div>
              </div>
            ) : role === 'DOCTOR' && doctor ? (
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Doctor Profile
                </p>
                <p className='font-semibold'>Details would be shown here</p>
              </div>
            ) : role === 'PATIENT' && patient ? (
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Patient Profile
                </p>
                <p className='font-semibold'>Details would be shown here</p>
              </div>
            ) : (
              <div className='py-4 text-center'>
                <p className='text-gray-500'>
                  No {role.toLowerCase()} profile details available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Card */}
      <Card className='mt-6'>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>System and profile details</CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm font-medium text-gray-500'>Profile Image</p>
              <div className='mt-2 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200'>
                {profile ? (
                  <img
                    src={profile}
                    alt={`${firstName} ${lastName}`}
                    className='h-24 w-24 rounded-full object-cover'
                  />
                ) : (
                  <UserIcon className='h-12 w-12 text-gray-400' />
                )}
              </div>
            </div>

            <div>
              <p className='text-sm font-medium text-gray-500'>
                Account Status
              </p>
              <div className='mt-2'>
                <Badge
                  variant={isActive ? 'default' : 'secondary'}
                  className={
                    isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {isActive ? 'Active Account' : 'Inactive Account'}
                </Badge>
              </div>

              <div className='mt-4'>
                <p className='text-sm font-medium text-gray-500'>Password</p>
                <p className='text-sm font-semibold'>Encrypted (bcrypt hash)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default ViewData
