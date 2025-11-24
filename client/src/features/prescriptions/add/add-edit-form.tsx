import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useCreatePrescription,
  useDoctorsSelect,
  usePatientsSelect,
  useUpdatePrescription,
} from '@/api/hooks'
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
import { Textarea } from '@/components/ui/textarea'

const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  duration: z.string().min(1, 'Duration is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
})

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  doctorId: z.string().min(1, 'Doctor selection is required'),
  medicines: z
    .array(medicineSchema)
    .min(1, 'At least one medicine is required'),
  instructions: z.string().min(1, 'Instructions are required'),
  validUntil: z.date({
    required_error: 'Expiry date is required',
  }),
})

type FormValues = z.infer<typeof formSchema>

interface PrescriptionFormProps {
  prescription?: any
  isEdit?: boolean
}

const PrescriptionForm = ({
  prescription,
  isEdit = false,
}: PrescriptionFormProps) => {
  const { data: patientsData, isLoading: isLoadingPatients } =
    usePatientsSelect({})
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctorsSelect(
    {}
  )

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

  const doctorOptions =
    doctorsData?.data?.map((doctor) => {
      const firstName = doctor.user?.firstName || ''
      const lastName = doctor.user?.lastName || ''
      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Doctor'

      return {
        value: doctor.id,
        label: `${fullName} - ${doctor.specialization || 'General'}`,
      }
    }) || []

  const initialValidUntil = prescription?.validUntil
    ? new Date(prescription.validUntil)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: prescription?.patientId || '',
      doctorId: prescription?.doctorId || '',
      medicines: prescription?.medicines || [
        { name: '', dosage: '', frequency: '', duration: '', quantity: 1 },
      ],
      instructions: prescription?.instructions || '',
      validUntil: initialValidUntil,
    },
  })

  const navigate = useNavigate()
  const createPrescription = useCreatePrescription()
  const updatePrescription = useUpdatePrescription()

  const handleSubmit = async (data: FormValues) => {
    const datePart = data.validUntil
    const combinedDate = new Date(datePart)
    const payload = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      medicines: data.medicines,
      instructions: data.instructions,
      validUntil: combinedDate.toISOString(),
    }

    if (isEdit && prescription) {
      updatePrescription.mutate(
        {
          id: prescription.id,
          updatedPrescription: payload,
        },
        {
          onSuccess: () => {
            toast.success('Prescription updated successfully!')
            navigate({ to: '/dashboard/prescriptions' })
          },
          onError: (error) => {
            console.error('Failed to update prescription:', error)
            toast.error('Failed to update prescription')
          },
        }
      )
    } else {
      createPrescription.mutate(payload, {
        onSuccess: () => {
          toast.success('Prescription created successfully!')
          navigate({ to: '/dashboard/prescriptions' })
        },
        onError: (error) => {
          console.error('Failed to create prescription:', error)
          toast.error('Failed to create prescription')
        },
      })
    }
  }

  const addMedicine = () => {
    const currentMedicines = form.getValues('medicines')
    form.setValue('medicines', [
      ...currentMedicines,
      { name: '', dosage: '', frequency: '', duration: '', quantity: 1 },
    ])
  }

  const removeMedicine = (index: number) => {
    const currentMedicines = form.getValues('medicines')
    if (currentMedicines.length > 1) {
      form.setValue(
        'medicines',
        currentMedicines.filter((_, i) => i !== index)
      )
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
              name='doctorId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Select Doctor</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={doctorOptions}
                      placeholder='Search for a doctor...'
                      onSelect={field.onChange}
                      value={field.value}
                      isLoading={isLoadingDoctors}
                      loadingText='Loading doctors...'
                      showCross={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medicines Section */}
            <div className='md:col-span-2'>
              <FormLabel required>Medicines</FormLabel>
              <div className='space-y-4'>
                {form.watch('medicines').map((_, index) => (
                  <div
                    key={index}
                    className='grid grid-cols-1 gap-4 md:grid-cols-5'
                  >
                    <FormField
                      control={form.control}
                      name={`medicines.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine Name</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., Aspirin' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., 100mg' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., Once daily' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g., 30 days' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medicines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min='1'
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {index > 0 && (
                      <div className='flex justify-end md:col-span-5'>
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => removeMedicine(index)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type='button'
                variant='outline'
                onClick={addMedicine}
                className='mt-4'
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Medicine
              </Button>
            </div>

            <FormField
              control={form.control}
              name='instructions'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter medication instructions (e.g., Take with food, Avoid alcohol)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='validUntil'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Valid Until Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disableFuture={false}
                      placeholder='Select expiry date'
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
              onClick={() => navigate({ to: '/dashboard/prescriptions' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={
                createPrescription.isPending || updatePrescription.isPending
              }
              loadingText={
                isEdit ? 'Updating prescription...' : 'Creating prescription...'
              }
            >
              {isEdit ? 'Update Prescription' : 'Create Prescription'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default PrescriptionForm
