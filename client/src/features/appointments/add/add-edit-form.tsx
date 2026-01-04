import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { Appointment } from '@/schema/appointments-schema'
import { toast } from 'sonner'
import {
  useCreateAppointment,
  useDoctorsSelect,
  usePatientsSelect,
  useUpdateAppointment,
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

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  doctorId: z.string().min(1, 'Doctor selection is required'),
  date: z.date({
    required_error: 'Appointment date is required',
  }),
  time: z.string().min(1, 'Appointment time is required'),
  reason: z.string().min(1, 'Reason for appointment is required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface AppointmentFormProps {
  appointment?: Appointment
  isEdit?: boolean
  preSelectedDoctorId?: string
}

const AppointmentForm = ({
  appointment,
  isEdit = false,
  preSelectedDoctorId,
}: AppointmentFormProps) => {
  // Provide empty object as default parameter if hooks require it
  const { data: patientsData, isLoading: isLoadingPatients } =
    usePatientsSelect({})
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctorsSelect(
    {}
  )

  // Safe mapping with fallbacks for patient data structure
  const patientOptions =
    patientsData?.data?.map((patient) => {
      // Handle different possible patient data structures
      const firstName = patient.user.firstName || ''
      const lastName = patient.user?.lastName || ''
      const fullName =
        firstName && lastName ? `${firstName} ${lastName}` : 'Unknown Patient'

      return {
        value: patient.id,
        label: fullName,
      }
    }) || []

  // Safe mapping with fallbacks for doctor data structure
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

  // Parse the existing appointment date/time if in edit mode
  const appointmentDate = appointment?.dateTime
    ? new Date(appointment.dateTime)
    : new Date()
  const appointmentTime = appointment?.dateTime
    ? format(appointmentDate, 'HH:mm')
    : '09:00'

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: appointment?.patientId || '',
      doctorId: preSelectedDoctorId || appointment?.doctorId || '',
      date: appointmentDate,
      time: appointmentTime,
      reason: appointment?.reason || '',
      notes: appointment?.notes || '',
    },
  })

  const navigate = useNavigate()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const handleSubmit = async (data: FormValues) => {
    // Combine date and time into a single ISO string
    const dateTime = new Date(data.date)
    const [hours, minutes] = data.time.split(':').map(Number)
    dateTime.setHours(hours, minutes, 0, 0)

    const payload = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      dateTime: dateTime.toISOString(),
      reason: data.reason,
      notes: data.notes,
    }

    if (isEdit && appointment) {
      updateAppointment.mutate(
        { id: appointment.id, updatedAppointment: payload },
        {
          onSuccess: () => {
            toast.success('Appointment updated successfully!')
            navigate({ to: '/dashboard/appointments' })
          },
        }
      )
    } else {
      createAppointment.mutate(payload, {
        onSuccess: () => {
          toast.success('Appointment created successfully!')
          navigate({ to: '/dashboard/appointments' })
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

            <FormField
              control={form.control}
              name='date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel required>Appointment Date</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='Pick a date'
                      disableFuture={false}
                      disablePast={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='time'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Appointment Time</FormLabel>
                  <FormControl>
                    <Input type='time' {...field} />
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
                  <FormLabel required>Reason for Appointment</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter reason for appointment (e.g., Regular checkup, Consultation)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter any additional notes or details about the appointment'
                      {...field}
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
              onClick={() => navigate({ to: '/dashboard/appointments' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={
                createAppointment.isPending || updateAppointment.isPending
              }
              loadingText={
                isEdit ? 'Updating appointment...' : 'Creating appointment...'
              }
            >
              {isEdit ? 'Update Appointment' : 'Create Appointment'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default AppointmentForm
