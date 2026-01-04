import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import type { MedicalRecord } from '@/schema/medical-records-schema'
import { toast } from 'sonner'
import {
  useCreateMedicalRecord,
  useDoctorsSelect,
  usePatientsSelect,
  useUpdateMedicalRecord,
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
import SearchableDropdown from '@/components/ui/searchable-dropdown'
import { Textarea } from '@/components/ui/textarea'
import FileUpload, { UploadedFile } from '@/components/file-upload'

const formSchema = z.object({
  patientId: z.string().min(1, 'Patient selection is required'),
  doctorId: z.string().min(1, 'Doctor selection is required'),
  symptoms: z.string().min(1, 'Symptoms are required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().min(1, 'Treatment plan is required'),
  notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MedicalRecordFormProps {
  medicalRecord?: MedicalRecord
  isEdit?: boolean
}

const MedicalRecordForm = ({
  medicalRecord,
  isEdit = false,
}: MedicalRecordFormProps) => {
  const { data: patientsData, isLoading: isLoadingPatients } =
    usePatientsSelect({})
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctorsSelect(
    {}
  )

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: medicalRecord?.patientId || '',
      doctorId: medicalRecord?.doctorId || '',
      symptoms: medicalRecord?.symptoms || '',
      diagnosis: medicalRecord?.diagnosis || '',
      treatment: medicalRecord?.treatment || '',
      notes: medicalRecord?.notes || '',
      attachments: medicalRecord?.attachments || [],
    },
  })

  const navigate = useNavigate()
  const createMedicalRecord = useCreateMedicalRecord()
  const updateMedicalRecord = useUpdateMedicalRecord()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      notes: data.notes,
      attachments: uploadedFiles.map((file) => file.path),
    }

    if (isEdit && medicalRecord) {
      updateMedicalRecord.mutate(
        { id: medicalRecord.id, updatedRecord: payload },
        {
          onSuccess: () => {
            toast.success('Medical record updated successfully!')
            navigate({ to: '/dashboard/medical-records' })
          },
        }
      )
    } else {
      createMedicalRecord.mutate(payload, {
        onSuccess: () => {
          toast.success('Medical record created successfully!')
          navigate({ to: '/dashboard/medical-records' })
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
              name='symptoms'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Symptoms</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter patient symptoms (e.g., Chest pain, shortness of breath, fever)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='diagnosis'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter medical diagnosis (e.g., Angina pectoris, Common cold, Hypertension)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='treatment'
              render={({ field }) => (
                <FormItem className='md:col-span-2'>
                  <FormLabel required>Treatment Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter treatment plan (e.g., Medication, Therapy, Surgery recommendations)'
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
                      placeholder='Enter any additional notes or observations'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className='md:col-span-2'>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <FileUpload
                  onFilesUploaded={setUploadedFiles}
                  existingFiles={medicalRecord?.attachments || []}
                  disabled={
                    createMedicalRecord.isPending ||
                    updateMedicalRecord.isPending
                  }
                />
              </FormControl>
            </FormItem>
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate({ to: '/dashboard/medical-records' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={
                createMedicalRecord.isPending || updateMedicalRecord.isPending
              }
              loadingText={
                isEdit
                  ? 'Updating medical record...'
                  : 'Creating medical record...'
              }
            >
              {isEdit ? 'Update Medical Record' : 'Create Medical Record'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default MedicalRecordForm
