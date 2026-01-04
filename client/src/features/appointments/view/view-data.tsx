import { Appointment } from '@/schema/appointments-schema'
import {
  Mail,
  UserIcon,
  Hash,
  Briefcase,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  MapPin,
  Phone,
  Droplets,
  CalendarDays,
  BadgeInfo,
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
  viewData: Appointment
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No appointment data available</p>
      </div>
    )
  }

  const {
    id,
    dateTime,
    duration,
    reason,
    status,
    notes,
    createdAt,
    patient,
    doctor,
  } = viewData

  // Format date and time
  const appointmentDate = new Date(dateTime).toLocaleDateString()
  const appointmentTime = new Date(dateTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  const createdDate = new Date(createdAt).toLocaleDateString()

  return (
    <div className='space-y-6'>
      {/* Appointment Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Appointment Details</CardTitle>
              <CardDescription>Appointment ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant={
                  status === 'SCHEDULED'
                    ? 'default'
                    : status === 'CANCELLED'
                      ? 'destructive'
                      : 'secondary'
                }
                className={
                  status === 'SCHEDULED'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                }
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Appointment Details */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <CalendarDays className='mr-2 h-5 w-5' />
            Appointment Details
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Date</p>
                <p className='font-semibold'>{appointmentDate}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Clock className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Time</p>
                <p className='font-semibold'>{appointmentTime}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Clock className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Duration</p>
                <p className='font-semibold'>{duration} minutes</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Created At</p>
                <p className='font-semibold'>{createdDate}</p>
              </div>
            </div>

            <div className='flex items-start md:col-span-2'>
              <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Reason</p>
                <p className='font-semibold'>{reason}</p>
              </div>
            </div>

            {notes && (
              <div className='flex items-start md:col-span-2'>
                <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Notes</p>
                  <p className='font-semibold'>{notes}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Patient Information */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <UserIcon className='mr-2 h-5 w-5' />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Name</p>
                  <p className='font-semibold'>
                    {patient.user.firstName} {patient.user.lastName}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>{patient.user.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Patient ID
                  </p>
                  <p className='text-sm font-semibold'>{patient.patientId}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <CalendarDays className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Date of Birth
                  </p>
                  <p className='font-semibold'>
                    {new Date(patient.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Gender</p>
                  <p className='font-semibold'>{patient.gender}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Droplets className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Blood Group
                  </p>
                  <p className='font-semibold'>{patient.bloodGroup}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Phone className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Contact Number
                  </p>
                  <p className='font-semibold'>{patient.contactNumber}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Phone className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Emergency Contact
                  </p>
                  <p className='font-semibold'>{patient.emergencyContact}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <MapPin className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Address</p>
                  <p className='font-semibold'>{patient.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <Stethoscope className='mr-2 h-5 w-5' />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Name</p>
                  <p className='font-semibold'>
                    Dr. {doctor.user.firstName} {doctor.user.lastName}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>{doctor.user.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    License Number
                  </p>
                  <p className='text-sm font-semibold'>
                    {doctor.licenseNumber}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Briefcase className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Specialization
                  </p>
                  <p className='font-semibold'>{doctor.specialization}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <BadgeInfo className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Experience
                  </p>
                  <p className='font-semibold'>{doctor.experience} years</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Briefcase className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Qualifications
                  </p>
                  <div className='mt-1 flex flex-wrap gap-1'>
                    {doctor.qualifications.map((qualification, index) => (
                      <Badge
                        key={index}
                        variant='secondary'
                        className='text-xs'
                      >
                        {qualification}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Consultation Fee
                  </p>
                  <p className='font-semibold'>Rs. {doctor.consultationFee}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <BadgeInfo className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Availability
                  </p>
                  <Badge
                    variant={doctor.isAvailable ? 'default' : 'secondary'}
                    className={
                      doctor.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {doctor.isAvailable ? 'Available' : 'Not Available'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ViewData
