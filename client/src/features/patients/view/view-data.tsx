import { Patient } from '@/schema/patients-schema'
import {
  Calendar,
  Mail,
  UserIcon,
  Shield,
  Hash,
  Phone,
  MapPin,
  HeartPulse,
  Contact2,
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
  viewData: Patient
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No patient data available</p>
      </div>
    )
  }

  const {
    patientId,
    dateOfBirth,
    gender,
    bloodGroup,
    contactNumber,
    emergencyContact,
    address,
    user,
  } = viewData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'Male'
      case 'FEMALE':
        return 'Female'
      case 'OTHER':
        return 'Other'
      default:
        return gender
    }
  }

  return (
    <div className='space-y-6'>
      {/* Patient Profile Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>
                {user.firstName} {user.middleName && `${user.middleName} `}
                {user.lastName}
              </CardTitle>
              <CardDescription>Patient Information</CardDescription>
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
              <Badge variant='outline' className='flex items-center'>
                <Shield className='mr-1 h-3 w-3' />
                {user.role}
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
                  <p className='text-sm font-medium text-gray-500'>Username</p>
                  <p className='font-semibold'>{user.username}</p>
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
                    Patient ID
                  </p>
                  <p className='text-sm font-semibold'>{patientId}</p>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-start'>
                <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Date of Birth
                  </p>
                  <p className='font-semibold'>{formatDate(dateOfBirth)}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Gender</p>
                  <p className='font-semibold'>{formatGender(gender)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <Phone className='mr-2 h-5 w-5' />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4 pt-6'>
            <div>
              <p className='text-sm font-medium text-gray-500'>
                Contact Number
              </p>
              <p className='font-semibold'>{contactNumber}</p>
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>
                Emergency Contact
              </p>
              <p className='font-semibold'>{emergencyContact}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <MapPin className='mr-2 h-5 w-5' />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <p className='font-semibold'>{address}</p>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <HeartPulse className='mr-2 h-5 w-5' />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='flex items-center'>
            <Contact2 className='mr-3 h-5 w-5 text-red-600' />
            <div>
              <p className='text-sm font-medium text-gray-500'>Blood Group</p>
              <p className='font-semibold'>{bloodGroup}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Empty Sections for Future Data */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle>Medical History</CardTitle>
          <CardDescription>
            Appointments, records, prescriptions and bills
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 text-center md:grid-cols-2 lg:grid-cols-4'>
            <div className='rounded-lg border p-4'>
              <p className='text-2xl font-bold'>0</p>
              <p className='text-sm text-gray-500'>Appointments</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-2xl font-bold'>0</p>
              <p className='text-sm text-gray-500'>Medical Records</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-2xl font-bold'>0</p>
              <p className='text-sm text-gray-500'>Prescriptions</p>
            </div>
            <div className='rounded-lg border p-4'>
              <p className='text-2xl font-bold'>0</p>
              <p className='text-sm text-gray-500'>Bills</p>
            </div>
          </div>
          <p className='mt-4 text-center text-gray-500'>
            No data available in these sections yet
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
