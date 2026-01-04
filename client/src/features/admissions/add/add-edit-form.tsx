import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  useCreateAdmission,
  useUpdateAdmission,
  useBedsSelect,
  usePatientsSelect,
} from '@/api/hooks'
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

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  bedId: z.string().min(1, 'Bed selection is required'),
  reason: z.string().min(1, 'Reason for admission is required'),
  totalAmount: z.number().min(0, 'Amount must be a positive number'),
})

type FormValues = z.infer<typeof formSchema>

interface AdmissionFormProps {
  admission?: any
  isEdit?: boolean
}

const AdmissionForm = ({ admission, isEdit = false }: AdmissionFormProps) => {
  const { data: patientsData, isLoading: isLoadingPatients } =
    usePatientsSelect({})
  const { data: bedsData, isLoading: isLoadingBeds } = useBedsSelect()

  const patientOptions =
    patientsData?.data?.map((patient) => {
      const firstName = patient.user.firstName || ''
      const lastName = patient.user?.lastName || ''
      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Patient'

      return {
        value: patient.id,
        label: fullName,
      }
    }) || []

  // Show available beds for new admissions, and include current bed when editing
  const bedOptions =
    bedsData?.data
      ?.filter((bed) => !bed.isOccupied || bed.id === admission?.bedId)
      .map((bed) => ({
        value: bed.id,
        label: `${bed.bedNumber} - ${bed.ward || 'Unknown Room'} (${bed.bedType || 'Unknown Type'})${bed.isOccupied ? ' - (Occupied)' : ''}`,
      })) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: admission?.patientId || '',
      bedId: admission?.bedId || '',
      reason: admission?.reason || '',
      totalAmount: admission?.totalAmount || 0,
    },
  })

  const navigate = useNavigate()
  const createAdmission = useCreateAdmission()
  const updateAdmission = useUpdateAdmission()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      patientId: data.patientId,
      bedId: data.bedId,
      reason: data.reason,
      totalAmount: data.totalAmount,
    }

    if (isEdit && admission) {
      updateAdmission.mutate(
        {
          id: admission.id,
          updatedAdmission: payload,
        },
        {
          onSuccess: () => {
            toast.success('Admission updated successfully!')
            navigate({ to: '/dashboard/admissions' })
          },
        }
      )
    } else {
      createAdmission.mutate(payload, {
        onSuccess: () => {
          toast.success('Admission created successfully!')
          navigate({ to: '/dashboard/admissions' })
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
                      onSelect={field.onChange}
                      value={field.value}
                      isLoading={isLoadingPatients}
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
              name='bedId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Select Bed</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={bedOptions}
                      placeholder='Search for a bed...'
                      onSelect={field.onChange}
                      value={field.value}
                      isLoading={isLoadingBeds}
                      loadingText='Loading beds...'
                      showCross={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Reason for Admission</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter reason for admission (e.g., Emergency surgery required)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='totalAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Total Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/dashboard/admissions' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createAdmission.isPending || updateAdmission.isPending}
              loadingText={
                isEdit ? 'Updating admission...' : 'Creating admission...'
              }
            >
              {isEdit ? 'Update Admission' : 'Create Admission'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default AdmissionForm
