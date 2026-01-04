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
  Calculator,
  CheckCircle,
  Clock,
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

  // Calculate comprehensive total like in bills view
  const calculateComprehensiveTotal = () => {
    const billTotal = bill?.totalAmount || 0

    // Add admission charges if available
    const admissionAmount = bill?.admission?.totalAmount
      ? parseFloat(bill.admission.totalAmount)
      : 0

    // Add all bill items
    const billItemsTotal =
      bill?.billItems?.reduce((sum, item) => {
        return sum + (item.totalPrice || 0)
      }, 0) || 0

    // Calculate bed charges if admission exists
    let bedCharges = 0
    if (bill?.admission && bill.admission.bed) {
      const pricePerDay = parseFloat(bill.admission.bed.pricePerDay) || 0
      const admissionDate = new Date(bill.admission.admissionDate)
      const dischargeDate = bill.admission.dischargeDate
        ? new Date(bill.admission.dischargeDate)
        : new Date() // Use current date if not discharged

      const daysDiff = Math.ceil(
        (dischargeDate.getTime() - admissionDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
    }

    // Add all charges: admission + bed + medical services + bill amount
    const comprehensiveTotal =
      admissionAmount + bedCharges + billItemsTotal + billTotal
    return comprehensiveTotal
  }

  const comprehensiveTotal = calculateComprehensiveTotal()

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
      {/* Payment Summary Overview */}
      <Card className='overflow-hidden border-0 shadow-lg'>
        <CardHeader className='bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 text-white'>
          <CardTitle className='flex items-center text-3xl font-bold'>
            <Calculator className='mr-3 h-8 w-8' />
            Payment Summary
          </CardTitle>
          <CardDescription className='text-base text-emerald-50'>
            {isAggregated
              ? 'Complete payment breakdown for this bill'
              : 'Individual payment transaction details'}
          </CardDescription>
        </CardHeader>
        <CardContent className='bg-gradient-to-br from-gray-50 to-white p-8'>
          {/* Main Payment Cards */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Total Payment Amount */}
            <div className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-sm font-medium text-green-100'>
                    {isAggregated ? 'Total Paid' : 'Payment Amount'}
                  </p>
                  <DollarSign className='h-6 w-6 text-green-200' />
                </div>
                <p className='mb-1 text-3xl font-bold'>Rs. {totalPaidAmount}</p>
                <p className='text-xs text-green-200'>
                  {isAggregated
                    ? `From ${paymentCount} transaction(s)`
                    : 'Single transaction'}
                </p>
              </div>
            </div>

            {/* Payment Status */}
            <div
              className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                statusInfo.label === 'Paid'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                  : statusInfo.label === 'Partial'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
              }`}
            >
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                  statusInfo.label === 'Paid'
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-700'
                    : statusInfo.label === 'Partial'
                      ? 'bg-gradient-to-br from-blue-400 to-blue-700'
                      : 'bg-gradient-to-br from-orange-400 to-orange-700'
                }`}
              ></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p
                    className={`text-sm font-medium ${
                      statusInfo.label === 'Paid'
                        ? 'text-emerald-100'
                        : statusInfo.label === 'Partial'
                          ? 'text-blue-100'
                          : 'text-orange-100'
                    }`}
                  >
                    Payment Status
                  </p>
                  {statusInfo.label === 'Paid' ? (
                    <CheckCircle className='h-6 w-6 text-emerald-200' />
                  ) : (
                    <Clock className='h-6 w-6 text-orange-200' />
                  )}
                </div>
                <p className='mb-1 text-2xl font-bold'>{statusInfo.label}</p>
                <p
                  className={`text-xs ${
                    statusInfo.label === 'Paid'
                      ? 'text-emerald-200'
                      : statusInfo.label === 'Partial'
                        ? 'text-blue-200'
                        : 'text-orange-200'
                  }`}
                >
                  Bill status
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-indigo-400 to-indigo-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-sm font-medium text-indigo-100'>
                    Payment Method
                  </p>
                  <CreditCard className='h-6 w-6 text-indigo-200' />
                </div>
                <p className='mb-1 text-2xl font-bold'>{paymentMethod}</p>
                <p className='text-xs text-indigo-200'>Transaction method</p>
              </div>
            </div>
          </div>

          {/* Comprehensive Charges Overview */}
          <div className='mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg'>
            <div className='mb-6 flex items-center justify-between'>
              <h4 className='text-xl font-semibold text-gray-700'>
                Payment vs Total Charges
              </h4>
              <span className='text-sm font-medium text-gray-500'>
                {comprehensiveTotal > 0
                  ? `${((totalPaidAmount / comprehensiveTotal) * 100).toFixed(1)}%`
                  : '0%'}{' '}
                of total paid
              </span>
            </div>

            {/* Main Payment vs Total */}
            <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-lg bg-green-50 p-4 text-center'>
                <p className='text-sm font-medium text-gray-600'>Amount Paid</p>
                <p className='text-2xl font-bold text-green-600'>
                  Rs. {totalPaidAmount}
                </p>
              </div>
              <div className='rounded-lg bg-blue-50 p-4 text-center'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Charges
                </p>
                <p className='text-2xl font-bold text-blue-600'>
                  Rs. {comprehensiveTotal.toFixed(0)}
                </p>
              </div>
            </div>

            {/* Charges Breakdown */}
            <div className='mb-6 border-t pt-6'>
              <h5 className='mb-4 text-lg font-semibold text-gray-700'>
                Charges Breakdown
              </h5>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                {/* Admission Charges */}
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-3 text-center'>
                  <p className='text-xs font-medium text-gray-600'>Admission</p>
                  <p className='text-lg font-bold text-purple-600'>
                    Rs.{' '}
                    {bill?.admission?.totalAmount
                      ? parseFloat(bill.admission.totalAmount).toFixed(0)
                      : '0'}
                  </p>
                </div>

                {/* Bed Charges */}
                <div className='rounded-lg border border-orange-200 bg-orange-50 p-3 text-center'>
                  <p className='text-xs font-medium text-gray-600'>
                    Bed Charges
                  </p>
                  <p className='text-lg font-bold text-orange-600'>
                    Rs.{' '}
                    {(() => {
                      if (bill?.admission && bill.admission.bed) {
                        const pricePerDay =
                          parseFloat(bill.admission.bed.pricePerDay) || 0
                        const admissionDate = new Date(
                          bill.admission.admissionDate
                        )
                        const dischargeDate = bill.admission.dischargeDate
                          ? new Date(bill.admission.dischargeDate)
                          : new Date()
                        const daysDiff = Math.ceil(
                          (dischargeDate.getTime() - admissionDate.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                        return (pricePerDay * Math.max(1, daysDiff)).toFixed(0)
                      }
                      return '0'
                    })()}
                  </p>
                </div>

                {/* Medical Services */}
                <div className='rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-center'>
                  <p className='text-xs font-medium text-gray-600'>
                    Medical Services
                  </p>
                  <p className='text-lg font-bold text-indigo-600'>
                    Rs.{' '}
                    {(
                      bill?.billItems?.reduce(
                        (sum, item) => sum + (item.totalPrice || 0),
                        0
                      ) || 0
                    ).toFixed(0)}
                  </p>
                </div>

                {/* Bill Amount */}
                <div className='rounded-lg border border-teal-200 bg-teal-50 p-3 text-center'>
                  <p className='text-xs font-medium text-gray-600'>
                    Bill Amount
                  </p>
                  <p className='text-lg font-bold text-teal-600'>
                    Rs. {bill?.totalAmount?.toFixed(0) || '0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className='mb-4 h-3 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-sm transition-all duration-700 ease-out'
                style={{
                  width: `${comprehensiveTotal > 0 ? Math.min((totalPaidAmount / comprehensiveTotal) * 100, 100) : 0}%`,
                }}
              ></div>
            </div>

            <div className='text-center'>
              <span
                className={`text-lg font-semibold ${
                  totalPaidAmount >= comprehensiveTotal
                    ? 'text-green-600'
                    : 'text-orange-600'
                }`}
              >
                {totalPaidAmount >= comprehensiveTotal
                  ? 'Fully Paid'
                  : `Rs. ${(comprehensiveTotal - totalPaidAmount).toFixed(0)} remaining`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Enhanced Payment Info */}
      <Card className='shadow-lg'>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center text-xl'>
            <Receipt className='mr-2 h-6 w-6' /> Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-6 pt-6 md:grid-cols-2'>
          <div className='flex items-start rounded-lg border border-green-200 bg-green-50 p-4'>
            <DollarSign className='mr-3 h-6 w-6 text-green-600' />
            <div>
              <p className='text-sm font-medium text-gray-700'>
                {isAggregated ? 'Total Paid Amount' : 'Payment Amount'}
              </p>
              <p className='text-xl font-bold text-green-600'>
                Rs. {totalPaidAmount}
              </p>
            </div>
          </div>

          {isAggregated && (
            <div className='flex items-start rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <Hash className='mr-3 h-6 w-6 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-700'>
                  Payment Count
                </p>
                <p className='text-xl font-bold text-blue-600'>
                  {paymentCount} transaction{paymentCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <div className='flex items-start rounded-lg border border-indigo-200 bg-indigo-50 p-4'>
            <CreditCard className='mr-3 h-6 w-6 text-indigo-600' />
            <div>
              <p className='text-sm font-medium text-gray-700'>
                Payment Method
              </p>
              <p className='text-xl font-bold text-indigo-600'>
                {paymentMethod}
              </p>
            </div>
          </div>

          {transactionId && (
            <div className='flex items-start rounded-lg border border-purple-200 bg-purple-50 p-4'>
              <Hash className='mr-3 h-6 w-6 text-purple-600' />
              <div>
                <p className='text-sm font-medium text-gray-700'>
                  Transaction ID
                </p>
                <p className='text-lg font-bold text-purple-600'>
                  {transactionId}
                </p>
              </div>
            </div>
          )}

          <div className='flex items-start rounded-lg border border-teal-200 bg-teal-50 p-4'>
            <Calendar className='mr-3 h-6 w-6 text-teal-600' />
            <div>
              <p className='text-sm font-medium text-gray-700'>Payment Date</p>
              <p className='text-lg font-bold text-teal-600'>
                {formatDateTime(paymentDate)}
              </p>
            </div>
          </div>

          {/* Cash-specific fields */}
          {paymentMethod === 'CASH' && (
            <>
              {receivedBy && (
                <div className='flex items-start rounded-lg border border-green-200 bg-green-50 p-4'>
                  <UserIcon className='mr-3 h-6 w-6 text-green-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Received By
                    </p>
                    <p className='text-lg font-bold text-green-600'>
                      {receivedBy}
                    </p>
                  </div>
                </div>
              )}

              {receiptNo && (
                <div className='flex items-start rounded-lg border border-orange-200 bg-orange-50 p-4'>
                  <Receipt className='mr-3 h-6 w-6 text-orange-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Receipt Number
                    </p>
                    <p className='text-lg font-bold text-orange-600'>
                      {receiptNo}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Bank-specific fields */}
          {paymentMethod === 'BANK' && (
            <>
              {bankName && (
                <div className='flex items-start rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <Building2 className='mr-3 h-6 w-6 text-blue-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Bank Name
                    </p>
                    <p className='text-lg font-bold text-blue-600'>
                      {bankName}
                    </p>
                  </div>
                </div>
              )}

              {cardLast4 && (
                <div className='flex items-start rounded-lg border border-indigo-200 bg-indigo-50 p-4'>
                  <CardIcon className='mr-3 h-6 w-6 text-indigo-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Card Last 4 Digits
                    </p>
                    <p className='text-lg font-bold text-indigo-600'>
                      ****{cardLast4}
                    </p>
                  </div>
                </div>
              )}

              {authorizationCode && (
                <div className='flex items-start rounded-lg border border-purple-200 bg-purple-50 p-4'>
                  <Shield className='mr-3 h-6 w-6 text-purple-600' />
                  <div>
                    <p className='text-sm font-medium text-gray-700'>
                      Authorization Code
                    </p>
                    <p className='text-lg font-bold text-purple-600'>
                      {authorizationCode}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {notes && (
            <div className='flex items-start rounded-lg border border-gray-200 bg-gray-50 p-4 md:col-span-2'>
              <FileText className='mr-3 h-6 w-6 text-gray-600' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700'>
                  Payment Notes
                </p>
                <p className='mt-1 text-lg font-semibold text-gray-800'>
                  {notes}
                </p>
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
                      <p className='font-semibold'>Rs. {payment.amount}</p>
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
            <p className='font-semibold'>Rs. {bill.totalAmount}</p>
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
