import { useState, useEffect } from 'react'
import { z } from 'zod'
import Cookies from 'js-cookie'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useCreatePayment, useUpdatePayment, useBills } from '@/api/hooks'
import { decryptData } from '@/lib/encryptionUtils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import SearchableDropdown from '@/components/ui/searchable-dropdown'
import { Textarea } from '@/components/ui/textarea'

type PaymentMethod = 'CASH' | 'BANK_TRANSFER'

interface CreatePaymentRequest {
  billId: string
  amount: number
  paymentMethod: PaymentMethod
  notes?: string
  // Cash-specific
  receivedBy?: string
  receiptNo?: string
  // Bank-specific
  bankName?: string
  transactionId?: string
  cardLast4?: string
  authorizationCode?: string
}

interface UpdatePaymentRequest {
  billId: string
  amount: number
  paymentMethod?: PaymentMethod
  notes?: string
  // Cash-specific
  receivedBy?: string
  receiptNo?: string
  // Bank-specific
  bankName?: string
  transactionId?: string
  cardLast4?: string
  authorizationCode?: string
}

const formSchema = z.object({
  billId: z.string().min(1, 'Bill selection is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER'], {
    required_error: 'Payment method is required',
  }),
  notes: z.string().optional(),
  // Cash-specific
  receivedBy: z.string().optional(),
  receiptNo: z.string().optional(),
  // Bank-specific
  bankName: z.string().optional(),
  transactionId: z.string().optional(),
  cardLast4: z.string().optional(),
  authorizationCode: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PaymentFormProps {
  payment?: any
  isEdit?: boolean
}

const PaymentForm = ({ payment, isEdit = false }: PaymentFormProps) => {
  const { data: billsData, isLoading: isLoadingBills } = useBills({})
  const [selectedBillId, setSelectedBillId] = useState(payment?.billId || '')
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>(
      (payment?.paymentMethod as PaymentMethod) || 'CASH'
    )

  // Get current user info for receivedBy field
  const getCurrentUser = () => {
    try {
      const userData = decryptData(Cookies.get('hms-user')) as any
      return userData
        ? `${userData.firstName} ${userData.lastName}`
        : 'Unknown User'
    } catch (error) {
      console.error('Failed to get current user:', error)
      return 'Unknown User'
    }
  }

  // Generate unique transaction ID
  const generateTransactionId = () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `TXN${timestamp}${randomStr}`
  }

  // Helper function to calculate bill charges
  const calculateBillCharges = (bill: any) => {
    let admissionCharge = 0
    let bedCharge = 0

    if (bill.admission) {
      admissionCharge = parseFloat(bill.admission.totalAmount || 0)

      if (bill.admission.bed?.pricePerDay) {
        const admissionDate = new Date(bill.admission.admissionDate)
        const dischargeDate = bill.admission.dischargeDate
          ? new Date(bill.admission.dischargeDate)
          : new Date()
        const daysDiff = Math.max(
          1,
          Math.ceil(
            (dischargeDate.getTime() - admissionDate.getTime()) /
            (24 * 60 * 60 * 1000)
          )
        )
        bedCharge = daysDiff * parseFloat(bill.admission.bed.pricePerDay)
      }
    }

    const billItemsTotal = (bill.billItems || []).reduce(
      (sum: number, item: any) => {
        // Skip items that are bed charges to avoid double counting with dynamic calculation
        if (item.description?.toLowerCase().includes('bed charge')) {
          return sum
        }
        return sum + (item.totalPrice || 0)
      },
      0
    )
    const actualTotalAmount = admissionCharge + bedCharge + billItemsTotal

    return {
      admissionCharge,
      bedCharge,
      billItemsTotal,
      actualTotalAmount,
    }
  }

  const billOptions =
    billsData?.data
      // Only show bills with remaining dues
      ?.filter((bill: any) => {
        const { actualTotalAmount } = calculateBillCharges(bill)
        const totalPaid = (bill.payments || []).reduce(
          (sum: number, p: any) => sum + Number(p.amount || 0),
          0
        )
        return actualTotalAmount - totalPaid > 0
      })
      .map((bill: any) => {
        const {
          admissionCharge,
          bedCharge,
          billItemsTotal,
          actualTotalAmount,
        } = calculateBillCharges(bill)

        const totalPaid = (bill.payments || []).reduce(
          (sum: number, p: any) => sum + Number(p.amount || 0),
          0
        )
        const remainingAmount = Math.max(0, actualTotalAmount - totalPaid)

        const patientName = `${bill.patient?.user?.firstName || 'Unknown'} ${bill.patient?.user?.lastName || 'Patient'}`

        return {
          value: bill.id,
          label: `Bill #${bill.billNumber} - ${patientName} - Due Rs ${remainingAmount}`,
          // Additional data for display
          admissionCharge,
          bedCharge,
          billItemsTotal,
          totalAmount: actualTotalAmount,
          paidAmount: totalPaid,
          remainingAmount,
          patientName,
          admission: bill.admission,
          billItems: bill.billItems,
        }
      }) || []

  const selectedBillOption = billOptions.find(
    (option) => option.value === selectedBillId
  )

  // Calculate the actual remaining amount using the selected bill option
  const remainingAmount = selectedBillOption
    ? selectedBillOption.remainingAmount
    : 0

  const paymentMethodOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  ]

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billId: payment?.billId || '',
      amount: payment?.amount || remainingAmount,
      paymentMethod: payment?.paymentMethod || 'CASH',
      notes: payment?.notes || '',
      // Cash-specific
      receivedBy: payment?.receivedBy || getCurrentUser(),
      receiptNo: payment?.receiptNo || '',
      // Bank-specific
      bankName: payment?.bankName || '',
      transactionId:
        payment?.transactionId ||
        (payment?.paymentMethod === 'BANK_TRANSFER' ? generateTransactionId() : ''),
      cardLast4: payment?.cardLast4 || '',
      authorizationCode: payment?.authorizationCode || '',
    },
  })

  const navigate = useNavigate()
  const createPayment = useCreatePayment()
  const updatePayment = useUpdatePayment()

  useEffect(() => {
    if (selectedBillId && !isEdit) {
      form.setValue('amount', remainingAmount)
    }
  }, [selectedBillId, remainingAmount, isEdit, form])

  const handleBillChange = (value: string | number) => {
    const billId = String(value)
    setSelectedBillId(billId)
    form.setValue('billId', billId)

    // Auto-generate transaction ID
    if (!form.getValues('transactionId')) {
      form.setValue('transactionId', generateTransactionId())
    }
  }

  const handlePaymentMethodChange = (value: string | number) => {
    const paymentMethod = String(value) as PaymentMethod
    setSelectedPaymentMethod(paymentMethod)
    form.setValue('paymentMethod', paymentMethod)

    // Auto-fill receivedBy for cash payments
    if (paymentMethod === 'CASH' && !payment?.receivedBy) {
      form.setValue('receivedBy', getCurrentUser())
    }

    // Auto-generate transaction ID for bank payments
    if (
      paymentMethod === 'BANK_TRANSFER' &&
      !payment?.transactionId &&
      !form.getValues('transactionId')
    ) {
      form.setValue('transactionId', generateTransactionId())
    }
  }

  const handleSubmit = async (data: FormValues) => {
    const payload: CreatePaymentRequest | UpdatePaymentRequest = {
      billId: data.billId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      // Cash-specific
      receivedBy: data.receivedBy,
      receiptNo: data.receiptNo,
      // Bank-specific
      bankName: data.bankName,
      transactionId: data.transactionId,
      cardLast4: data.cardLast4,
      authorizationCode: data.authorizationCode,
    }

    if (isEdit && payment) {
      updatePayment.mutate(
        {
          id: payment.id,
          updatedPayment: payload as UpdatePaymentRequest,
        },
        {
          onSuccess: () => {
            toast.success('Payment updated successfully!')
            navigate({ to: '/dashboard/payments' })
          },
        }
      )
    } else {
      createPayment.mutate(payload as CreatePaymentRequest, {
        onSuccess: () => {
          toast.success('Payment created successfully!')
          navigate({ to: '/dashboard/payments' })
        },
      })
    }
  }

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='billId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Select Bill</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={billOptions}
                      placeholder='Search for a bill...'
                      onSelect={handleBillChange}
                      value={field.value}
                      isLoading={isLoadingBills}
                      loadingText='Loading bills...'
                      showCross={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='paymentMethod'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Payment Method</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={paymentMethodOptions}
                      placeholder='Select payment method...'
                      onSelect={handlePaymentMethodChange}
                      value={field.value}
                      showCross={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='amount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Amount (Rs)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='Enter amount'
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='transactionId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction ID (Auto-generated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Auto-generated transaction ID'
                      {...field}
                      readOnly
                      className='bg-muted/50'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bill Charge Breakdown */}
          {selectedBillOption && (
            <div className='bg-muted/30 rounded-lg border p-4'>
              <h3 className='mb-3 text-lg font-semibold'>
                Bill Charge Breakdown
              </h3>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5'>
                {/* Existing cards for charges */}
                {selectedBillOption.admissionCharge > 0 && (
                  <div className='bg-card rounded border p-3'>
                    <p className='text-muted-foreground text-sm'>
                      Admission Charge
                    </p>
                    <p className='text-lg font-semibold'>
                      Rs {selectedBillOption.admissionCharge.toFixed(2)}
                    </p>
                  </div>
                )}

                {selectedBillOption.bedCharge > 0 && (
                  <div className='bg-card rounded border p-3'>
                    <p className='text-muted-foreground text-sm'>Bed Charge</p>
                    <p className='text-lg font-semibold'>
                      Rs {selectedBillOption.bedCharge.toFixed(2)}
                    </p>
                    {selectedBillOption.admission && (
                      <p className='text-muted-foreground text-xs'>
                        {selectedBillOption.admission.bed?.bedNumber} -{' '}
                        {selectedBillOption.admission.bed?.bedType}
                      </p>
                    )}
                  </div>
                )}

                {selectedBillOption.billItemsTotal > 0 && (
                  <div className='bg-card rounded border p-3'>
                    <p className='text-muted-foreground text-sm'>
                      Services/Items
                    </p>
                    <p className='text-lg font-semibold'>
                      Rs {selectedBillOption.billItemsTotal.toFixed(2)}
                    </p>
                    <p className='text-muted-foreground text-xs'>
                      {selectedBillOption.billItems?.length || 0} item(s)
                    </p>
                  </div>
                )}

                <div className='bg-primary/5 rounded border p-3'>
                  <p className='text-muted-foreground text-sm'>Total Amount</p>
                  <p className='text-primary text-lg font-semibold'>
                    Rs {selectedBillOption.totalAmount.toFixed(2)}
                  </p>
                </div>

                <div className='bg-green-50 rounded border p-3'>
                  <p className='text-muted-foreground text-sm'>Paid Amount</p>
                  <p className='text-green-600 text-lg font-semibold'>
                    Rs {selectedBillOption.paidAmount.toFixed(2)}
                  </p>
                </div>

                {selectedBillOption.remainingAmount > 0 && (
                  <div className='bg-red-50 border-red-200 rounded border p-3'>
                    <p className='text-red-600 text-sm font-medium'>Remaining Due</p>
                    <p className='text-red-700 text-xl font-bold'>
                      Rs {selectedBillOption.remainingAmount.toFixed(2)}
                    </p>
                    <p className='text-red-500 text-xs mt-1 animate-pulse'>
                      Action Required
                    </p>
                  </div>
                )}
              </div>

              {/* Bill Items Detail */}
              {selectedBillOption.billItems &&
                selectedBillOption.billItems.length > 0 && (
                  <div className='mt-4'>
                    <h4 className='mb-2 text-sm font-medium'>Bill Items:</h4>
                    <div className='space-y-1'>
                      {selectedBillOption.billItems.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className='flex justify-between text-sm'
                          >
                            <span>{item.description}</span>
                            <span>Rs {item.totalPrice.toFixed(2)}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Cash-specific fields */}
          {selectedPaymentMethod === 'CASH' && (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='receivedBy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received By</FormLabel>
                    <FormControl>
                      <Input placeholder='Staff/cashier name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='receiptNo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receipt Number</FormLabel>
                    <FormControl>
                      <Input placeholder='Receipt tracking number' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Bank-specific fields */}
          {selectedPaymentMethod === 'BANK_TRANSFER' && (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <FormField
                control={form.control}
                name='bankName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Nabil, NIC Asia, etc.' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='cardLast4'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Last 4 Digits</FormLabel>
                    <FormControl>
                      <Input placeholder='1234' maxLength={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='authorizationCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authorization Code</FormLabel>
                    <FormControl>
                      <Input placeholder='From POS machine' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name='notes'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Additional notes about the payment...'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/dashboard/payments' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createPayment.isPending || updatePayment.isPending}
              loadingText={
                isEdit ? 'Updating payment...' : 'Creating payment...'
              }
            >
              {isEdit ? 'Update Payment' : 'Create Payment'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default PaymentForm
