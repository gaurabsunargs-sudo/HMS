import { Bill } from '@/schema'
import {
  UserIcon,
  Hash,
  Calendar,
  FileText,
  DollarSign,
  Phone,
  Droplets,
  MapPin,
  CreditCard,
  CalendarClock,
  Receipt,
  Package,
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
  viewData: Bill
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No bill data available</p>
      </div>
    )
  }

  const {
    id,
    billNumber,
    totalAmount,
    dueDate,
    status,
    createdAt,
    updatedAt,
    patient,
    admission,
    billItems,
  } = viewData

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const due = formatDate(dueDate)
  const created = formatDateTime(createdAt)
  const updated = formatDateTime(updatedAt)

  // Calculate bill status colors
  const getStatusConfig = (status: string) => {
    const statusConfig = {
      PAID: {
        label: 'Paid',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800',
        icon: '✓',
      },
      PENDING: {
        label: 'Pending',
        variant: 'outline' as const,
        className: 'bg-yellow-100 text-yellow-800',
        icon: '⏰',
      },
      OVERDUE: {
        label: 'Overdue',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-800',
        icon: '⚠️',
      },
      CANCELLED: {
        label: 'Cancelled',
        variant: 'destructive' as const,
        className: 'bg-gray-100 text-gray-800',
        icon: '❌',
      },
      PARTIAL: {
        label: 'Partial',
        variant: 'outline' as const,
        className: 'bg-blue-100 text-blue-800',
        icon: '💰',
      },
    }

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: 'outline' as const,
        className: 'bg-gray-100 text-gray-800',
        icon: '❓',
      }
    )
  }

  const statusConfig = getStatusConfig(status)

  return (
    <div className='space-y-6'>
      {/* Bill Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Bill Details</CardTitle>
              <CardDescription>Bill ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant={statusConfig.variant}
                className={statusConfig.className}
              >
                {statusConfig.label}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bill Summary */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <Receipt className='mr-2 h-5 w-5' />
            Bill Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start'>
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bill Number</p>
                <p className='font-semibold'>{billNumber}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Total Amount
                </p>
                <p className='font-semibold'>${totalAmount}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CalendarClock className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Due Date</p>
                <p className='font-semibold'>{due}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CreditCard className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Status</p>
                <p className='font-semibold'>{statusConfig.label}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Created At</p>
                <p className='font-semibold'>{created}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Updated At</p>
                <p className='font-semibold'>{updated}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Items */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <Package className='mr-2 h-5 w-5' />
            Bill Items ({billItems?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          {billItems && billItems.length > 0 ? (
            <div className='space-y-4'>
              {billItems.map((item, index) => (
                <div key={index} className='rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <p className='font-medium'>{item.description}</p>
                      <p className='text-sm text-gray-500'>
                        {item.quantity} × ${item.unitPrice}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>${item.totalPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className='mt-4 border-t pt-4'>
                <div className='flex items-center justify-between text-lg font-semibold'>
                  <span>Total</span>
                  <span>${totalAmount}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className='text-gray-500'>No bill items found</p>
          )}
        </CardContent>
      </Card>

      {/* Admission Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <FileText className='mr-2 h-5 w-5' />
            Admission Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start'>
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Admission ID
                </p>
                <p className='font-semibold'>{admission?.id || 'N/A'}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Admission Date
                </p>
                <p className='font-semibold'>
                  {admission?.admissionDate
                    ? formatDateTime(admission.admissionDate)
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Status</p>
                <p className='font-semibold capitalize'>
                  {admission?.status || 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Admission Amount
                </p>
                <p className='font-semibold'>
                  ${admission?.totalAmount || '0'}
                </p>
              </div>
            </div>

            {admission?.reason && (
              <div className='flex items-start md:col-span-2'>
                <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Reason</p>
                  <p className='font-semibold'>{admission.reason}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <UserIcon className='mr-2 h-5 w-5' />
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
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
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Patient ID</p>
                <p className='text-sm font-semibold'>
                  {patient?.patientId || 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Date of Birth
                </p>
                <p className='font-semibold'>
                  {patient?.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Gender</p>
                <p className='font-semibold'>{patient?.gender || 'N/A'}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Droplets className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Blood Group</p>
                <p className='font-semibold'>{patient?.bloodGroup || 'N/A'}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Phone className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Contact Number
                </p>
                <p className='font-semibold'>
                  {patient?.contactNumber || 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <Phone className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Emergency Contact
                </p>
                <p className='font-semibold'>
                  {patient?.emergencyContact || 'N/A'}
                </p>
              </div>
            </div>

            <div className='flex items-start md:col-span-2'>
              <MapPin className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Address</p>
                <p className='font-semibold'>{patient?.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
