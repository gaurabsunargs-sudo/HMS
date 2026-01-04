import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { Patient } from '@/schema/patients-schema'
import { toast } from 'sonner'
import { useCreatePatient, useUpdatePatient, usePatientsSelect } from '@/api/hooks'
import { useGetUsersWithoutProfiles } from '@/api/hooks/useUsers'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react'

// Define blood group and gender types explicitly
const bloodGroupValues = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const
const genderValues = ['MALE', 'FEMALE', 'OTHER'] as const

const formSchema = z.object({
  userId: z.string().min(1, 'User selection is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(genderValues, {
    required_error: 'Gender is required',
  }),
  bloodGroup: z.enum(bloodGroupValues, {
    required_error: 'Blood group is required',
  }),
  contactNumber: z
    .string()
    .min(1, 'Contact number is required')
    .regex(/^[0-9]+$/, 'Contact number must contain only numbers'),
  emergencyContact: z
    .string()
    .min(1, 'Emergency contact is required')
    .regex(/^[0-9]+$/, 'Emergency contact must contain only numbers'),
  address: z.string().min(1, 'Address is required'),
})

type FormValues = z.infer<typeof formSchema>

interface PatientEnrollmentFormProps {
  patient?: Patient & {
    currentMedications?: string
  }
  isEdit?: boolean
}

const PatientEnrollmentForm = ({
  patient,
  isEdit = false,
}: PatientEnrollmentFormProps) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
    patient || null
  )

  const { data: usersData, isLoading: isLoadingUsers } =
    useGetUsersWithoutProfiles()

  const { data: patientsData, isLoading: isLoadingPatients } =
    usePatientsSelect({})

  const userOptions =
    usersData?.data?.map((user) => ({
      value: user.id,
      label: `${user.firstName} ${user.lastName} (${user.username})`,
    })) || []

  const patientOptions =
    patientsData?.data?.map((patient) => ({
      value: patient.id,
      label: `${patient.user.firstName} ${patient.user.lastName} - ${patient.patientId}`,
    })) || []

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: patient?.userId || '',
      patientId: patient?.patientId || '',
      dateOfBirth: patient?.dateOfBirth
        ? new Date(patient.dateOfBirth)
        : undefined,
      gender: patient?.gender as (typeof genderValues)[number] | undefined,
      bloodGroup: patient?.bloodGroup as
        | (typeof bloodGroupValues)[number]
        | undefined,
      contactNumber: patient?.contactNumber || '',
      emergencyContact: patient?.emergencyContact || '',
      address: patient?.address || '',
    },
  })

  // Update form when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      form.reset({
        userId: selectedPatient.userId,
        patientId: selectedPatient.patientId,
        dateOfBirth: new Date(selectedPatient.dateOfBirth),
        gender: selectedPatient.gender as (typeof genderValues)[number],
        bloodGroup: selectedPatient.bloodGroup as (typeof bloodGroupValues)[number],
        contactNumber: selectedPatient.contactNumber,
        emergencyContact: selectedPatient.emergencyContact,
        address: selectedPatient.address,
      })
    } else if (!patient) {
      form.reset({
        userId: '',
        patientId: '',
        dateOfBirth: undefined,
        gender: undefined,
        bloodGroup: undefined,
        contactNumber: '',
        emergencyContact: '',
        address: '',
      })
    }
  }, [selectedPatient, patient, form])

  // Handle patient selection from dropdown
  const handlePatientSelect = (patientId: string | number) => {
    const id = String(patientId)
    setSelectedPatientId(id)
    const patient = patientsData?.data?.find((p) => p.id === id)
    setSelectedPatient(patient || null)
  }

  const navigate = useNavigate()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
    }

    // If we have a selected patient or are in edit mode, update
    if (selectedPatient || (isEdit && patient)) {
      const patientToUpdate = selectedPatient || patient
      if (!patientToUpdate) return

      updatePatient.mutate(
        { id: patientToUpdate.id, updatedPatient: payload },
        {
          onSuccess: () => {
            toast.success('Patient updated successfully!')
            navigate({ to: '/dashboard/patients' })
          },
        }
      )
    } else {
      // Create new patient
      createPatient.mutate(payload, {
        onSuccess: () => {
          toast.success('Patient created successfully!')
          navigate({ to: '/dashboard/patients' })
        },
      })
    }
  }

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {!isEdit && (
              <div className='md:col-span-2'>
                <FormItem>
                  <FormLabel>Select Existing Patient (Optional)</FormLabel>
                  <FormControl>
                    <SearchableDropdown
                      options={patientOptions}
                      placeholder='Search for an existing patient...'
                      onSelect={handlePatientSelect}
                      value={selectedPatientId}
                      isLoading={isLoadingPatients}
                      loadingText='Loading patients...'
                      showCross={true}
                    />
                  </FormControl>
                  <p className='text-sm text-muted-foreground mt-1'>
                    Select a patient to update their information, or leave empty to create a new patient profile
                  </p>
                </FormItem>
              </div>
            )}

            {!isEdit && !selectedPatient ? (
              <FormField
                control={form.control}
                name='userId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Select User</FormLabel>
                    <FormControl>
                      <SearchableDropdown
                        options={userOptions}
                        placeholder='Search for a user...'
                        onSelect={field.onChange}
                        value={field.value}
                        isLoading={isLoadingUsers}
                        loadingText='Loading users...'
                        showCross={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (isEdit || selectedPatient) ? (
              <FormItem>
                <FormLabel required>User Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={true}
                    value={
                      selectedPatient
                        ? `${selectedPatient.user.firstName} ${selectedPatient.user.middleName || ''} ${selectedPatient.user.lastName}`.trim()
                        : patient
                          ? `${patient.user.firstName} ${patient.user.middleName || ''} ${patient.user.lastName}`.trim()
                          : ''
                    }
                  />
                </FormControl>
              </FormItem>
            ) : null}

            <FormField
              control={form.control}
              name='patientId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>
                    {isEdit ? 'Your Last Patient ID Is' : 'Patient ID'}{' '}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter patient ID'
                      {...field}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='dateOfBirth'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel required>Date of Birth</FormLabel>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    disableFuture={true}
                    placeholder='Select date of birth'
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='gender'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Gender</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select gender' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='MALE'>Male</SelectItem>
                      <SelectItem value='FEMALE'>Female</SelectItem>
                      <SelectItem value='OTHER'>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='bloodGroup'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Blood Group</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select blood group' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bloodGroupValues.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contactNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter contact number' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='emergencyContact'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Emergency Contact</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter emergency contact' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder='Enter full address' {...field} />
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
              onClick={() => navigate({ to: '/dashboard/patients' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createPatient.isPending || updatePatient.isPending}
              loadingText={
                selectedPatient || isEdit ? 'Updating patient...' : 'Creating patient...'
              }
            >
              {selectedPatient || isEdit ? 'Update Patient' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default PatientEnrollmentForm
