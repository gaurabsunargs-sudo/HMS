import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateBill, useUpdateBill, useAdmissions } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import DatePicker from '@/components/ui/date-picker'
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

const billItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be a positive number'),
  totalPrice: z.number().min(0, 'Total price must be a positive number'),
})

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  admissionId: z.string().min(1, 'Admission selection is required'),
  billNumber: z.string().min(1, 'Bill number is required'),
  dueDate: z.date({ required_error: 'Due date is required' }),
  billItems: z
    .array(billItemSchema)
    .min(1, 'At least one bill item is required'),
})

type FormValues = z.infer<typeof formSchema>

interface BillFormProps {
  bill?: any
  isEdit?: boolean
}

const BillForm = ({ bill, isEdit = false }: BillFormProps) => {
  // Build patient dropdown from admissions that are currently ADMITTED
  const [selectedPatientId, setSelectedPatientId] = useState(
    bill?.patientId || ''
  )
  const [totalAmount, setTotalAmount] = useState(0)

  const { data: admissionsData, isLoading: isLoadingAdmissions } =
    useAdmissions({
      page: 1,
      limit: 100,
      search: '',
      status: 'ADMITTED',
    })

  // Build patient dropdown from admissions (ensure unique patients)
  const patientOptions = Array.from(
    new Map(
      admissionsData?.data?.map((admission) => {
        const patient = admission.patient
        const firstName = patient?.user?.firstName || ''
        const lastName = patient?.user?.lastName || ''
        const fullName =
          firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Patient'

        return [patient.id, { value: patient.id, label: fullName }]
      }) || []
    ).values()
  )

  // Only allow bills for currently admitted patients, filtered by selected patient
  const admissionOptions =
    admissionsData?.data
      ?.filter(
        (admission) =>
          admission.status === 'ADMITTED' &&
          (!selectedPatientId || admission.patientId === selectedPatientId)
      )
      .map((admission) => ({
        value: admission.id,
        label: `Admission #${admission.id.slice(0, 8)} - ${new Date(admission.admissionDate).toLocaleDateString()}`,
      })) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: bill?.patientId || '',
      admissionId: bill?.admissionId || '',
      billNumber:
        bill?.billNumber || `BILL${Math.floor(1000 + Math.random() * 9000)}`,
      dueDate: bill?.dueDate ? new Date(bill.dueDate) : new Date(),
      billItems:
        bill?.billItems?.length > 0
          ? bill.billItems
          : [{ description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }],
    },
  })

  const navigate = useNavigate()
  const createBill = useCreateBill()
  const updateBill = useUpdateBill()

  // Calculate total amount from bill items
  const calculateTotalAmount = (billItems: any[]) => {
    return billItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
  }

  // Calculate total price for a specific bill item
  const calculateTotalPrice = (index: number) => {
    const quantity = form.getValues(`billItems.${index}.quantity`)
    const unitPrice = form.getValues(`billItems.${index}.unitPrice`)
    const totalPrice = quantity * unitPrice

    form.setValue(`billItems.${index}.totalPrice`, totalPrice)

    // Update the overall total amount
    const billItems = form.getValues('billItems')
    const newTotalAmount = calculateTotalAmount(billItems)
    setTotalAmount(newTotalAmount)
  }

  // Initialize total amount when form loads or when editing an existing bill
  useEffect(() => {
    if (bill?.billItems) {
      const initialTotalAmount = calculateTotalAmount(bill.billItems)
      setTotalAmount(initialTotalAmount)
    }
  }, [bill])

  // Watch for changes in bill items and recalculate total amount
  const watchedBillItems = form.watch('billItems')
  useEffect(() => {
    const newTotalAmount = calculateTotalAmount(watchedBillItems)
    setTotalAmount(newTotalAmount)
  }, [watchedBillItems])

  const handlePatientChange = (value: string | number) => {
    const patientId = String(value)
    setSelectedPatientId(patientId)
    form.setValue('patientId', patientId)

    // Filter admissions for this patient
    const patientAdmissions =
      admissionsData?.data?.filter(
        (adm) => adm.patientId === patientId && adm.status === 'ADMITTED'
      ) || []

    // If only one admission, auto-select it
    if (patientAdmissions.length === 1) {
      form.setValue('admissionId', patientAdmissions[0].id)
    } else {
      form.setValue('admissionId', '')
    }
  }

  const addBillItem = () => {
    const currentItems = form.getValues('billItems')
    form.setValue('billItems', [
      ...currentItems,
      { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 },
    ])
  }

  const removeBillItem = (index: number) => {
    const currentItems = form.getValues('billItems')
    if (currentItems.length > 1) {
      const newItems = currentItems.filter((_, i) => i !== index)
      form.setValue('billItems', newItems)

      const newTotalAmount = calculateTotalAmount(newItems)
      setTotalAmount(newTotalAmount)
    }
  }

  const handleSubmit = async (data: FormValues) => {
    const dueDate = data.dueDate.toISOString()

    const payload = {
      patientId: data.patientId,
      admissionId: data.admissionId,
      billNumber: data.billNumber,
      dueDate,
      totalAmount,
      billItems: data.billItems,
    }

    if (isEdit && bill) {
      updateBill.mutate(
        {
          id: bill.id,
          updatedBill: payload,
        },
        {
          onSuccess: () => {
            toast.success('Bill updated successfully!')
            navigate({ to: '/dashboard/bills' })
          },
        }
      )
    } else {
      createBill.mutate(payload, {
        onSuccess: () => {
          toast.success('Bill created successfully!')
          navigate({ to: '/dashboard/bills' })
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
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Select Patient</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={patientOptions}
                      placeholder='Search for a patient...'
                      onSelect={handlePatientChange}
                      value={field.value}
                      isLoading={isLoadingAdmissions}
                      loadingText='Loading patients...'
                      showCross={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='admissionId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Select Admission</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={admissionOptions}
                      placeholder={
                        selectedPatientId
                          ? 'Select admission...'
                          : 'First select a patient'
                      }
                      onSelect={field.onChange}
                      value={field.value}
                      isLoading={isLoadingAdmissions}
                      loadingText='Loading admissions...'
                      showCross={true}
                      disabled={!selectedPatientId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='billNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Bill Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter bill number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dueDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Due Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Select due date'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='mt-8'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>Bill Items</h3>
              <Button
                type='button'
                onClick={addBillItem}
                className='flex items-center gap-2'
              >
                <Plus size={16} />
                Add Item
              </Button>
            </div>

            {form.watch('billItems').map((_, index) => (
              <div
                key={index}
                className='mb-4 grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-12'
              >
                <FormField
                  control={form.control}
                  name={`billItems.${index}.description`}
                  render={({ field }) => (
                    <FormItem className='md:col-span-5'>
                      <FormLabel required>Description</FormLabel>
                      <FormControl>
                        <Input placeholder='Item description' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`billItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel required>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min='1'
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value))
                            calculateTotalPrice(index)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`billItems.${index}.unitPrice`}
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel required>Unit Price (Rs)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value))
                            calculateTotalPrice(index)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`billItems.${index}.totalPrice`}
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Total Price (Rs)</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          {...field}
                          readOnly
                          className='bg-muted'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex items-end justify-center pb-2 md:col-span-1'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => removeBillItem(index)}
                    disabled={form.watch('billItems').length <= 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className='bg-muted flex items-center justify-between rounded-lg p-4'>
            <span className='text-lg font-semibold'>Total Amount:</span>
            <span className='text-xl font-bold'>
              Rs {totalAmount.toFixed(2)}
            </span>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/dashboard/bills' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createBill.isPending || updateBill.isPending}
              loadingText={isEdit ? 'Updating bill...' : 'Creating bill...'}
            >
              {isEdit ? 'Update Bill' : 'Create Bill'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default BillForm
