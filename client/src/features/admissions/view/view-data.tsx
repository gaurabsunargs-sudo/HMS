import { Admission } from '@/schema'
import {
  Mail,
  UserIcon,
  Hash,
  Calendar,
  BedDouble,
  FileText,
  DollarSign,
  MapPin,
  Phone,
  Droplets,
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

interface ViewDataProps {
  viewData: Admission
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No admission data available</p>
      </div>
    )
  }

  const {
    id,
    admissionDate,
    dischargeDate,
    reason,
    status,
    totalAmount,
    createdAt,
    patient,
    bed,
    bills,
  } = viewData

  // Format dates
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not discharged'
    return new Date(dateString).toLocaleDateString()
  }

  const admission = new Date(admissionDate).toLocaleDateString()
  const discharge = formatDate(dischargeDate ? dischargeDate : '')
  const created = new Date(createdAt).toLocaleDateString()

  // Check if patient is currently admitted
  const isAdmitted = status === 'ADMITTED'

  const paymentRows = (bills || []).flatMap(
    (b) =>
      (b as any).payments?.map((p: any) => ({
        billNumber: (b as any).billNumber,
        amount:
          typeof p.amount === 'number' ? p.amount : parseFloat(p.amount || 0),
        method: p.paymentMethod,
        date: new Date(p.paymentDate).toLocaleString(),
        transactionId: p.transactionId,
      })) || []
  )

  // Financial summary values
  const admissionCharge = Number(totalAmount || 0)
  const billsCharge = (bills || []).reduce(
    (sum, b: any) => sum + Number((b as any).totalAmount || 0),
    0
  )
  let bedCharge = 0
  const startMs = new Date(admissionDate).getTime()
  const endMs = dischargeDate ? new Date(dischargeDate).getTime() : Date.now()
  const pricePerDay = bed?.pricePerDay ? parseFloat(String(bed.pricePerDay)) : 0
  if (pricePerDay > 0 && startMs) {
    const days = Math.max(
      1,
      Math.ceil((endMs - startMs) / (24 * 60 * 60 * 1000))
    )
    bedCharge = days * pricePerDay
  }
  const totalComputed = admissionCharge + billsCharge + bedCharge
  const totalPaid = paymentRows.reduce((s, r) => s + Number(r.amount || 0), 0)
  const remaining = Math.max(0, totalComputed - totalPaid)

  return (
    <div className='space-y-6'>
      {/* Admission Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Admission Details</CardTitle>
              <CardDescription>Admission ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant='secondary'
                className={
                  isAdmitted
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
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
            <div className='flex items-start md:col-span-2'>
              <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Reason</p>
                <p className='font-semibold'>{reason}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CalendarCheck className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Admission Date
                </p>
                <p className='font-semibold'>{admission}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <CalendarX className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Discharge Date
                </p>
                <p className='font-semibold'>{discharge}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Total Amount
                </p>
                <p className='font-semibold'>Rs {totalAmount}</p>
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

      {/* Bed Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <BedDouble className='mr-2 h-5 w-5' />
            Bed Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start'>
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bed Number</p>
                <p className='font-semibold'>{bed?.bedNumber}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <BedDouble className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bed Type</p>
                <p className='font-semibold'>{bed?.bedType}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <MapPin className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Ward</p>
                <p className='font-semibold'>{bed?.ward}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Price Per Day
                </p>
                <p className='font-semibold'>Rs {bed?.pricePerDay}/day</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Badge
                variant='secondary'
                className={
                  bed?.isOccupied
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }
              >
                {bed?.isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
              </Badge>
            </div>
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
              <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Email</p>
                <p className='font-semibold'>{patient?.user?.email || 'N/A'}</p>
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
      {/* Financial Summary */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <DollarSign className='mr-2 h-5 w-5' />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6'>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Admission Charge</p>
              <p className='text-sm font-semibold'>
                Rs {admissionCharge.toFixed(2)}
              </p>
            </div>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Bed Charge</p>
              <p className='text-sm font-semibold'>Rs {bedCharge.toFixed(2)}</p>
            </div>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Bills Charge</p>
              <p className='text-sm font-semibold'>
                Rs {billsCharge.toFixed(2)}
              </p>
            </div>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Total</p>
              <p className='text-sm font-semibold'>
                Rs {totalComputed.toFixed(2)}
              </p>
            </div>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Paid</p>
              <p className='text-sm font-semibold'>Rs {totalPaid.toFixed(2)}</p>
            </div>
            <div className='rounded border p-3'>
              <p className='text-xs text-gray-500'>Remaining</p>
              <p className='text-sm font-semibold'>Rs {remaining.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <DollarSign className='mr-2 h-5 w-5' />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          {paymentRows.length === 0 ? (
            <div className='text-sm text-gray-500'>
              No payments recorded for this admission.
            </div>
          ) : (
            <div className='space-y-2'>
              {paymentRows.map((row, idx) => (
                <div
                  key={idx}
                  className='grid grid-cols-1 gap-2 rounded border p-2 md:grid-cols-5'
                >
                  <div className='text-sm'>
                    <span className='font-medium'>Bill:</span> {row.billNumber}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Amount:</span> Rs {row.amount}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Method:</span> {row.method}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Date:</span> {row.date}
                  </div>
                  <div className='text-sm'>
                    <span className='font-medium'>Txn:</span>{' '}
                    {row.transactionId || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
