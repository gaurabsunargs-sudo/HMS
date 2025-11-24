import { Payment } from '@/schema'
import {
  UserIcon,
  Hash,
  Calendar,
  FileText,
  DollarSign,
  CreditCard,
  Receipt,
  Building2,
  CreditCard as CardIcon,
  Shield,
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
  viewData: Payment | any // Allow aggregated payment data
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No payment data available</p>
      </div>
    )
  }

  // Check if this is aggregated data (has payments array)
  const isAggregated = viewData.payments && Array.isArray(viewData.payments)

  // For aggregated data, use the latest payment for display
  const displayPayment = isAggregated ? viewData.latestPayment : viewData

  const {
    id,
    amount,
    paymentMethod,
    transactionId,
    paymentDate,
    notes,
    bill,
    // Cash-specific
    receivedBy,
    receiptNo,
    // Bank-specific
    bankName,
    cardLast4,
    authorizationCode,
  } = displayPayment

  // For aggregated data, get additional info
  const totalPaidAmount = isAggregated ? viewData.totalPaidAmount : amount
  const paymentCount = isAggregated ? viewData.paymentCount : 1
  const allPayments = isAggregated ? viewData.payments : [displayPayment]

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString()
  const formatDateTime = (dateString: string) =>
    new Date(dateString).toLocaleString()

  const statusConfig: Record<string, any> = {
    PAID: { label: 'Paid', className: 'bg-green-100 text-green-800' },
    PARTIAL: { label: 'Partial', className: 'bg-blue-100 text-blue-800' },
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    OVERDUE: { label: 'Overdue', className: 'bg-red-100 text-red-800' },
  }

  const statusInfo = statusConfig[bill.status] || {
    label: bill.status,
    className: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className='space-y-6'>
      {/* Payment Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Payment Details</CardTitle>
              <CardDescription>Payment ID: {id}</CardDescription>
            </div>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <Receipt className='mr-2 h-5 w-5' /> Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 pt-6 md:grid-cols-2'>
          <div className='flex items-start'>
            <DollarSign className='mr-2 h-5 w-5 text-blue-600' />
            <div>
              <p className='text-sm text-gray-500'>
                {isAggregated ? 'Total Paid Amount' : 'Amount'}
              </p>
              <p className='font-semibold'>Rs {totalPaidAmount}</p>
            </div>
          </div>

          {isAggregated && (
            <div className='flex items-start'>
              <Hash className='mr-2 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-gray-500'>Payment Count</p>
                <p className='font-semibold'>
                  {paymentCount} payment{paymentCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <div className='flex items-start'>
            <CreditCard className='mr-2 h-5 w-5 text-blue-600' />
            <div>
              <p className='text-sm text-gray-500'>Method</p>
              <p className='font-semibold'>{paymentMethod}</p>
            </div>
          </div>

          {transactionId && (
            <div className='flex items-start'>
              <Hash className='mr-2 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-gray-500'>Transaction ID</p>
                <p className='font-semibold'>{transactionId}</p>
              </div>
            </div>
          )}

          <div className='flex items-start'>
            <Calendar className='mr-2 h-5 w-5 text-blue-600' />
            <div>
              <p className='text-sm text-gray-500'>Payment Date</p>
              <p className='font-semibold'>{formatDateTime(paymentDate)}</p>
            </div>
          </div>

          {/* Cash-specific fields */}
          {paymentMethod === 'CASH' && (
            <>
              {receivedBy && (
                <div className='flex items-start'>
                  <UserIcon className='mr-2 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Received By</p>
                    <p className='font-semibold'>{receivedBy}</p>
                  </div>
                </div>
              )}

              {receiptNo && (
                <div className='flex items-start'>
                  <Receipt className='mr-2 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Receipt Number</p>
                    <p className='font-semibold'>{receiptNo}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bank-specific fields */}
          {paymentMethod === 'BANK' && (
            <>
              {bankName && (
                <div className='flex items-start'>
                  <Building2 className='mr-2 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Bank Name</p>
                    <p className='font-semibold'>{bankName}</p>
                  </div>
                </div>
              )}

              {cardLast4 && (
                <div className='flex items-start'>
                  <CardIcon className='mr-2 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Card Last 4 Digits</p>
                    <p className='font-semibold'>****{cardLast4}</p>
                  </div>
                </div>
              )}

              {authorizationCode && (
                <div className='flex items-start'>
                  <Shield className='mr-2 h-5 w-5 text-blue-600' />
                  <div>
                    <p className='text-sm text-gray-500'>Authorization Code</p>
                    <p className='font-semibold'>{authorizationCode}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {notes && (
            <div className='flex items-start md:col-span-2'>
              <FileText className='mr-2 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm text-gray-500'>Notes</p>
                <p className='font-semibold'>{notes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Payments (for aggregated data) */}
      {isAggregated && allPayments.length > 1 && (
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <Receipt className='mr-2 h-5 w-5 text-blue-600' />
              All Payments ({paymentCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {allPayments.map((payment: any, index: number) => (
                <div
                  key={payment.id}
                  className='rounded-lg border bg-gray-50 p-4'
                >
                  <div className='grid gap-2 md:grid-cols-3'>
                    <div>
                      <p className='text-sm text-gray-500'>
                        Payment #{index + 1}
                      </p>
                      <p className='font-semibold'>Rs {payment.amount}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Method</p>
                      <p className='font-semibold'>{payment.paymentMethod}</p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>Date</p>
                      <p className='font-semibold'>
                        {formatDateTime(payment.paymentDate)}
                      </p>
                    </div>
                    {payment.transactionId && (
                      <div>
                        <p className='text-sm text-gray-500'>Transaction ID</p>
                        <p className='font-semibold'>{payment.transactionId}</p>
                      </div>
                    )}
                    {payment.receivedBy && (
                      <div>
                        <p className='text-sm text-gray-500'>Received By</p>
                        <p className='font-semibold'>{payment.receivedBy}</p>
                      </div>
                    )}
                    {payment.notes && (
                      <div className='md:col-span-3'>
                        <p className='text-sm text-gray-500'>Notes</p>
                        <p className='font-semibold'>{payment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bill Summary */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <FileText className='mr-2 h-5 w-5 text-blue-600' />
            Bill Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 pt-6 md:grid-cols-2'>
          <div>
            <p className='text-sm text-gray-500'>Bill Number</p>
            <p className='font-semibold'>{bill.billNumber}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Total Amount</p>
            <p className='font-semibold'>Rs {bill.totalAmount}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Due Date</p>
            <p className='font-semibold'>{formatDate(bill.dueDate)}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Created</p>
            <p className='font-semibold'>{formatDateTime(bill.createdAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Patient Info */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <UserIcon className='mr-2 h-5 w-5 text-blue-600' /> Patient
            Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 pt-6 md:grid-cols-2'>
          <div>
            <p className='text-sm text-gray-500'>Name</p>
            <p className='font-semibold'>
              {bill.patient.user.firstName} {bill.patient.user.middleName || ''}{' '}
              {bill.patient.user.lastName || ''}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Patient ID</p>
            <p className='font-semibold'>{bill.patient.patientId}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>DOB</p>
            <p className='font-semibold'>
              {formatDate(bill.patient.dateOfBirth)}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Gender</p>
            <p className='font-semibold'>{bill.patient.gender}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Contact</p>
            <p className='font-semibold'>{bill.patient.contactNumber}</p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>Emergency Contact</p>
            <p className='font-semibold'>{bill.patient.emergencyContact}</p>
          </div>

          <div className='md:col-span-2'>
            <p className='text-sm text-gray-500'>Address</p>
            <p className='font-semibold'>{bill.patient.address}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
