import {
  Mail,
  UserIcon,
  Hash,
  Briefcase,
  Calendar,
  Stethoscope,
  FileText,
  ClipboardList,
  Pill,
  Clock,
  CalendarCheck,
  CalendarX,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Define the actual Medicine type based on your API response
interface Medicine {
  id: string
  prescriptionId: string
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  notes?: string
  createdAt: string
}

// Define the actual Prescription type based on your API response
interface ApiPrescription {
  id: string
  patientId: string
  doctorId: string
  instructions: string
  issuedDate: string
  validUntil: string
  createdAt: string
  patient: {
    id: string
    userId: string
    patientId: string
    dateOfBirth: string
    gender: string
    bloodGroup: string
    contactNumber: string
    emergencyContact: string
    address: string
    user: {
      id: string
      username: string
      email: string
      firstName: string
      middleName?: string | null
      lastName?: string | null
      profile: string | null
      role: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
  doctor: {
    id: string
    userId: string
    licenseNumber: string
    specialization: string
    experience: number
    qualifications: string[]
    consultationFee: string
    isAvailable: boolean
    user: {
      id: string
      username: string
      email: string
      firstName: string
      middleName?: string | null
      lastName?: string | null
      profile: string | null
      role: string
      isActive: boolean
      createdAt: string
      updatedAt: string
    }
  }
  medicines: Medicine[]
}

interface ViewDataProps {
  viewData: ApiPrescription | null
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No prescription data available</p>
      </div>
    )
  }

  const {
    id,
    instructions,
    issuedDate,
    validUntil,
    createdAt,
    patient,
    doctor,
    medicines,
  } = viewData

  // Format dates
  const issued = new Date(issuedDate).toLocaleDateString()
  const valid = new Date(validUntil).toLocaleDateString()
  const created = new Date(createdAt).toLocaleDateString()

  // Check if prescription is still valid
  const isValid = new Date(validUntil) > new Date()

  return (
    <div className='space-y-6'>
      {/* Prescription Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Prescription Details</CardTitle>
              <CardDescription>Prescription ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant='secondary'
                className={
                  isValid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }
              >
                {isValid ? 'VALID' : 'EXPIRED'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prescription Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <FileText className='mr-2 h-5 w-5' />
            Prescription Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start md:col-span-2'>
              <ClipboardList className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Instructions
                </p>
                <p className='font-semibold'>{instructions}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CalendarCheck className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Issued Date</p>
                <p className='font-semibold'>{issued}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CalendarX className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Valid Until</p>
                <p className='font-semibold'>{valid}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Created At</p>
                <p className='font-semibold'>{created}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <Pill className='mr-2 h-5 w-5' />
            Prescribed Medicines
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='space-y-4'>
            {medicines.map((medicine, index) => (
              <Card key={medicine.id} className={index > 0 ? 'mt-4' : ''}>
                <CardContent className='pt-6'>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='flex items-start md:col-span-2'>
                      <Pill className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Medicine Name
                        </p>
                        <p className='font-semibold'>{medicine.name}</p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Dosage
                        </p>
                        <p className='font-semibold'>{medicine.dosage}</p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Clock className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Frequency
                        </p>
                        <p className='font-semibold'>{medicine.frequency}</p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Duration
                        </p>
                        <p className='font-semibold'>{medicine.duration}</p>
                      </div>
                    </div>

                    <div className='flex items-start'>
                      <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                      <div>
                        <p className='text-sm font-medium text-gray-500'>
                          Quantity
                        </p>
                        <p className='font-semibold'>{medicine.quantity}</p>
                      </div>
                    </div>

                    {medicine.notes && (
                      <div className='flex items-start md:col-span-2'>
                        <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                        <div>
                          <p className='text-sm font-medium text-gray-500'>
                            Notes
                          </p>
                          <p className='font-semibold'>{medicine.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
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
                    {patient?.user?.firstName || 'Unknown'}
                    {patient?.user?.middleName && ` ${patient.user.middleName}`}
                    {patient?.user?.lastName && ` ${patient.user.lastName}`}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>
                    {patient?.user?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Patient ID
                  </p>
                  <p className='text-sm font-semibold'>
                    {patient?.patientId || 'N/A'}
                  </p>
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
                    Dr. {doctor?.user?.firstName || 'Unknown'}{' '}
                    {doctor?.user?.lastName || ''}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>
                    {doctor?.user?.email || 'N/A'}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    License Number
                  </p>
                  <p className='text-sm font-semibold'>
                    {doctor?.licenseNumber || 'N/A'}
                  </p>
                </div>
              </div>

              <div className='flex items-start'>
                <Briefcase className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Specialization
                  </p>
                  <p className='font-semibold'>
                    {doctor?.specialization || 'N/A'}
                  </p>
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
