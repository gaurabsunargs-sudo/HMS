// @ts-nocheck
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
  Calculator,
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
    payments,
  } = viewData

  // Calculate total amount including all charges
  const calculateTotalAmount = () => {
    const billTotal = totalAmount || 0

    // Add admission charges if available
    const admissionAmount = admission?.totalAmount
      ? parseFloat(admission.totalAmount)
      : 0

    // Add all bill items (medical services)
    const billItemsTotal =
      billItems?.reduce((sum, item) => {
        return sum + (item.totalPrice || 0)
      }, 0) || 0

    // Calculate bed charges if admission exists
    let bedCharges = 0
    if (admission && admission.bed) {
      const pricePerDay = parseFloat(admission.bed.pricePerDay) || 0
      const admissionDate = new Date(admission.admissionDate)
      const dischargeDate = admission.dischargeDate
        ? new Date(admission.dischargeDate)
        : new Date() // Use current date if not discharged

      const daysDiff = Math.ceil(
        (dischargeDate.getTime() - admissionDate.getTime()) /
          (1000 * 60 * 60 * 24)
      )
      bedCharges = pricePerDay * Math.max(1, daysDiff) // At least 1 day
    }

    // Calculate total from individual components
    // Add all charges: admission + bed + medical services + bill amount
    const grandTotal = admissionAmount + bedCharges + billItemsTotal + billTotal

    return grandTotal
  }

  // Calculate payments
  const calculatePayments = () => {
    const paymentsArray = payments || []
    const totalPaid = paymentsArray.reduce((sum, payment) => {
      return sum + (parseFloat(payment.amount) || 0)
    }, 0)
    return totalPaid
  }

  const grandTotal = calculateTotalAmount()
  const totalPaid = calculatePayments()
  const remainingBalance = grandTotal - totalPaid

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
      {/* Total Amount Overview */}
      <Card className='overflow-hidden border-0 shadow-lg'>
        <CardHeader className='bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white'>
          <CardTitle className='flex items-center text-3xl font-bold'>
            <Calculator className='mr-3 h-8 w-8' />
            Payment Summary
          </CardTitle>
          <CardDescription className='text-base text-emerald-50'>
            Complete breakdown of all charges and payments
          </CardDescription>
        </CardHeader>
        <CardContent className='bg-gradient-to-br from-gray-50 to-white p-8'>
          {/* Main Summary with Enhanced Cards */}
          <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'>
            {/* Grand Total */}
            <div className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-sm font-medium text-blue-100'>
                    Grand Total
                  </p>
                  <DollarSign className='h-6 w-6 text-blue-200' />
                </div>
                <p className='mb-1 text-3xl font-bold'>
                  Rs. {grandTotal.toFixed(0)}
                </p>
                <p className='text-xs text-blue-200'>Total amount due</p>
              </div>
            </div>

            {/* Amount Paid */}
            <div className='group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-400 to-green-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100'></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p className='text-sm font-medium text-green-100'>
                    Amount Paid
                  </p>
                  <CreditCard className='h-6 w-6 text-green-200' />
                </div>
                <p className='mb-1 text-3xl font-bold'>
                  Rs. {totalPaid.toFixed(0)}
                </p>
                <p className='text-xs text-green-200'>
                  {grandTotal > 0
                    ? `${((totalPaid / grandTotal) * 100).toFixed(1)}% completed`
                    : 'No payments yet'}
                </p>
              </div>
            </div>

            {/* Balance Due */}
            <div
              className={`group relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${remainingBalance > 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}
            >
              <div
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${remainingBalance > 0 ? 'bg-gradient-to-br from-red-400 to-red-700' : 'bg-gradient-to-br from-emerald-400 to-emerald-700'}`}
              ></div>
              <div className='relative z-10'>
                <div className='mb-3 flex items-center justify-between'>
                  <p
                    className={`text-sm font-medium ${remainingBalance > 0 ? 'text-red-100' : 'text-emerald-100'}`}
                  >
                    {remainingBalance > 0 ? 'Balance Due' : 'Fully Paid'}
                  </p>
                  <div
                    className={`h-6 w-6 ${remainingBalance > 0 ? 'text-red-200' : 'text-emerald-200'}`}
                  >
                    {remainingBalance > 0 ? (
                      <Receipt className='h-6 w-6' />
                    ) : (
                      <div className='text-xl'>✓</div>
                    )}
                  </div>
                </div>
                <p className='mb-1 text-3xl font-bold'>
                  Rs. {Math.abs(remainingBalance).toFixed(0)}
                </p>
                <p
                  className={`text-xs ${remainingBalance > 0 ? 'text-red-200' : 'text-emerald-200'}`}
                >
                  {remainingBalance > 0
                    ? 'Remaining to pay'
                    : 'Payment completed'}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Progress Bar */}
          <div className='mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-lg'>
            <div className='mb-3 flex items-center justify-between'>
              <h4 className='text-lg font-semibold text-gray-700'>
                Payment Progress
              </h4>
              <span className='text-sm font-medium text-gray-500'>
                {grandTotal > 0
                  ? `${((totalPaid / grandTotal) * 100).toFixed(1)}%`
                  : '0%'}{' '}
                Complete
              </span>
            </div>
            <div className='h-3 w-full overflow-hidden rounded-full bg-gray-200'>
              <div
                className='h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 shadow-sm transition-all duration-700 ease-out'
                style={{
                  width: `${grandTotal > 0 ? Math.min((totalPaid / grandTotal) * 100, 100) : 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Enhanced Detailed Breakdown */}
          <div className='border-t border-gray-200 pt-8'>
            <div className='mb-6 flex items-center'>
              <div className='mr-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 p-2'>
                <Package className='h-5 w-5 text-white' />
              </div>
              <h3 className='text-2xl font-bold text-gray-800'>
                Charges Breakdown
              </h3>
            </div>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
              {/* Admission Charges */}
              <div className='group relative overflow-hidden rounded-xl border-2 border-purple-100 bg-white p-6 shadow-lg transition-all duration-300 hover:border-purple-300 hover:shadow-xl'>
                <div className='absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-10'></div>
                <div className='relative z-10'>
                  <div className='mb-4 flex items-center'>
                    <div className='mr-3 rounded-lg bg-purple-100 p-2'>
                      <FileText className='h-5 w-5 text-purple-600' />
                    </div>
                    <p className='text-sm font-semibold text-gray-700'>
                      Admission Charges
                    </p>
                  </div>
                  <p className='mb-2 text-2xl font-bold text-purple-600'>
                    Rs.{' '}
                    {admission?.totalAmount
                      ? parseFloat(admission.totalAmount).toFixed(0)
                      : '0'}
                  </p>
                  <p className='text-xs text-gray-500'>Initial admission fee</p>
                </div>
              </div>

              {/* Bed Charges */}
              <div className='group relative overflow-hidden rounded-xl border-2 border-orange-100 bg-white p-6 shadow-lg transition-all duration-300 hover:border-orange-300 hover:shadow-xl'>
                <div className='absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-orange-400 to-orange-600 opacity-10'></div>
                <div className='relative z-10'>
                  <div className='mb-4 flex items-center'>
                    <div className='mr-3 rounded-lg bg-orange-100 p-2'>
                      <Calendar className='h-5 w-5 text-orange-600' />
                    </div>
                    <p className='text-sm font-semibold text-gray-700'>
                      Bed Charges
                    </p>
                  </div>
                  <p className='mb-2 text-2xl font-bold text-orange-600'>
                    Rs.{' '}
                    {(() => {
                      if (admission && admission.bed) {
                        const pricePerDay =
                          parseFloat(admission.bed.pricePerDay) || 0
                        const admissionDate = new Date(admission.admissionDate)
                        const dischargeDate = admission.dischargeDate
                          ? new Date(admission.dischargeDate)
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
                  {admission && admission.bed && (
                    <div className='text-xs text-gray-500'>
                      <p>Rs. {admission.bed.pricePerDay}/day</p>
                      <p>
                        ×{' '}
                        {(() => {
                          const admissionDate = new Date(
                            admission.admissionDate
                          )
                          const dischargeDate = admission.dischargeDate
                            ? new Date(admission.dischargeDate)
                            : new Date()
                          return (
                            Math.ceil(
                              (dischargeDate.getTime() -
                                admissionDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            ) || 1
                          )
                        })()}{' '}
                        days
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Services */}
              <div className='group relative overflow-hidden rounded-xl border-2 border-indigo-100 bg-white p-6 shadow-lg transition-all duration-300 hover:border-indigo-300 hover:shadow-xl'>
                <div className='absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-indigo-400 to-indigo-600 opacity-10'></div>
                <div className='relative z-10'>
                  <div className='mb-4 flex items-center'>
                    <div className='mr-3 rounded-lg bg-indigo-100 p-2'>
                      <Package className='h-5 w-5 text-indigo-600' />
                    </div>
                    <p className='text-sm font-semibold text-gray-700'>
                      Medical Services
                    </p>
                  </div>
                  <p className='mb-2 text-2xl font-bold text-indigo-600'>
                    Rs.{' '}
                    {(
                      billItems?.reduce(
                        (sum, item) => sum + (item.totalPrice || 0),
                        0
                      ) || 0
                    ).toFixed(0)}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {billItems?.length || 0} service items
                  </p>
                </div>
              </div>

              {/* Original Bill Amount */}
              <div className='group relative overflow-hidden rounded-xl border-2 border-teal-100 bg-white p-6 shadow-lg transition-all duration-300 hover:border-teal-300 hover:shadow-xl'>
                <div className='absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-br from-teal-400 to-teal-600 opacity-10'></div>
                <div className='relative z-10'>
                  <div className='mb-4 flex items-center'>
                    <div className='mr-3 rounded-lg bg-teal-100 p-2'>
                      <Receipt className='h-5 w-5 text-teal-600' />
                    </div>
                    <p className='text-sm font-semibold text-gray-700'>
                      Bill Amount
                    </p>
                  </div>
                  <p className='mb-2 text-2xl font-bold text-teal-600'>
                    Rs. {totalAmount?.toFixed(0) || '0'}
                  </p>
                  <p className='text-xs text-gray-500'>Original bill total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Payment History */}
          {payments && payments.length > 0 && (
            <div className='mt-8 border-t border-gray-200 pt-8'>
              <div className='mb-6 flex items-center'>
                <div className='mr-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-2'>
                  <CreditCard className='h-5 w-5 text-white' />
                </div>
                <h3 className='text-2xl font-bold text-gray-800'>
                  Payment History
                </h3>
              </div>

              <div className='mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                  <div className='text-center'>
                    <p className='mb-2 text-sm font-medium text-gray-600'>
                      Total Payments
                    </p>
                    <p className='text-2xl font-bold text-green-600'>
                      Rs. {totalPaid.toFixed(0)}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='mb-2 text-sm font-medium text-gray-600'>
                      Number of Transactions
                    </p>
                    <p className='text-2xl font-bold text-blue-600'>
                      {payments.length}
                    </p>
                  </div>
                  <div className='text-center'>
                    <p className='mb-2 text-sm font-medium text-gray-600'>
                      Average Payment
                    </p>
                    <p className='text-2xl font-bold text-purple-600'>
                      Rs.{' '}
                      {payments.length > 0
                        ? (totalPaid / payments.length).toFixed(0)
                        : '0'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Individual Payment Details */}
              <div className='space-y-4'>
                {payments.slice(0, 3).map((payment, index) => (
                  <div
                    key={index}
                    className='rounded-lg border border-gray-100 bg-white p-4 shadow-md transition-shadow duration-300 hover:shadow-lg'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center'>
                        <div className='mr-4 rounded-full bg-green-100 p-2'>
                          <CreditCard className='h-4 w-4 text-green-600' />
                        </div>
                        <div>
                          <p className='font-semibold text-gray-800'>
                            Rs. {parseFloat(payment.amount).toFixed(0)}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {new Date(payment.paymentDate).toLocaleDateString()}{' '}
                            • {payment.paymentMethod}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        {payment.receiptNo && (
                          <p className='text-sm font-medium text-gray-600'>
                            Receipt: {payment.receiptNo}
                          </p>
                        )}
                        {payment.receivedBy && (
                          <p className='text-xs text-gray-500'>
                            By: {payment.receivedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {payments.length > 3 && (
                  <div className='pt-4 text-center'>
                    <p className='text-sm text-gray-500'>
                      And {payments.length - 3} more payment(s)...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                <p className='text-sm font-medium text-gray-500'>Bill Amount</p>
                <p className='font-semibold'>Rs. {totalAmount}</p>
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
                        {item.quantity} × Rs. {item.unitPrice}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>Rs. {item.totalPrice}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className='mt-4 border-t pt-4'>
                <div className='flex items-center justify-between text-lg font-semibold'>
                  <span>Total</span>
                  <span>Rs. {totalAmount}</span>
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
                  Rs. {admission?.totalAmount || '0'}
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
