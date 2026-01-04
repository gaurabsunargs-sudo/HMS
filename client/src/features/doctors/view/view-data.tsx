import { Doctor } from '@/schema/doctors-schema'
import {
  Mail,
  UserIcon,
  Hash,
  Briefcase,
  GraduationCap,
  DollarSign,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ViewDataProps {
  viewData: Doctor
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No doctor data available</p>
      </div>
    )
  }

  const {
    licenseNumber,
    specialization,
    experience,
    qualifications,
    consultationFee,
    isAvailable,
    user,
    _count,
  } = viewData

  return (
    <div className='space-y-6'>
      {/* Doctor Profile Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                Dr. {user.firstName} {user.middleName && `${user.middleName} `}
                {user.lastName}
              </CardTitle>
              <CardDescription>{specialization} Specialist</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant={user.isActive ? 'default' : 'secondary'}
                className={
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              <Badge
                variant={isAvailable ? 'default' : 'secondary'}
                className={
                  isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {isAvailable ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Name</p>
                  <p className='font-semibold'>
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>{user.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    License Number
                  </p>
                  <p className='text-sm font-semibold'>{licenseNumber}</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start'>
                <Briefcase className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Specialization
                  </p>
                  <p className='font-semibold'>{specialization}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Experience
                  </p>
                  <p className='font-semibold'>{experience} years</p>
                </div>
              </div>

              <div className='flex items-start'>
                <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Consultation Fee
                  </p>
                  <p className='font-semibold'>Rs. {consultationFee}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <GraduationCap className='mr-2 h-5 w-5' />
            Qualifications
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex flex-wrap gap-2'>
            {qualifications.map((qualification, index) => (
              <Badge key={index} variant='secondary' className='text-sm'>
                {qualification}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      {_count && (
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle>Practice Summary</CardTitle>
            <CardDescription>
              Appointments, prescriptions and medical records
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='grid grid-cols-1 gap-4 text-center md:grid-cols-3'>
              <div className='rounded-lg border p-4'>
                <p className='text-2xl font-bold'>{_count.appointments}</p>
                <p className='text-sm text-gray-500'>Appointments</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-2xl font-bold'>{_count.prescriptions}</p>
                <p className='text-sm text-gray-500'>Prescriptions</p>
              </div>
              <div className='rounded-lg border p-4'>
                <p className='text-2xl font-bold'>{_count.medicalRecords}</p>
                <p className='text-sm text-gray-500'>Medical Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>System details</CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm font-medium text-gray-500'>User ID</p>
              <p className='text-sm font-semibold'>{user.id}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>
                Account Status
              </p>
              <Badge
                variant={user.isActive ? 'default' : 'secondary'}
                className={
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {user.isActive ? 'Active Account' : 'Inactive Account'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
