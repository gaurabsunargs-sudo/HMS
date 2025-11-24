import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useCreateBed, useUpdateBed } from '@/api/hooks'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const bedTypeValues = ['GENERAL', 'ICU', 'PRIVATE', 'EMERGENCY'] as const

const formSchema = z.object({
  bedNumber: z.string().min(1, 'Bed number is required'),
  bedType: z.enum(bedTypeValues, {
    required_error: 'Bed type is required',
  }),
  ward: z.string().min(1, 'Ward is required'),
  pricePerDay: z.number().min(0, 'Price must be a positive number'),
})

type FormValues = z.infer<typeof formSchema>

interface BedFormProps {
  bed?: any
  isEdit?: boolean
}

const BedForm = ({ bed, isEdit = false }: BedFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bedNumber: bed?.bedNumber || '',
      bedType: bed?.bedType || undefined,
      ward: bed?.ward || '',
      pricePerDay: bed?.pricePerDay || 0,
    },
  })

  const navigate = useNavigate()
  const createBed = useCreateBed()
  const updateBed = useUpdateBed()

  const handleSubmit = async (data: FormValues) => {
    const payload = {
      bedNumber: data.bedNumber,
      bedType: data.bedType,
      ward: data.ward,
      pricePerDay: data.pricePerDay,
    }

    if (isEdit && bed) {
      updateBed.mutate(
        {
          id: bed.id,
          updatedBed: payload,
        },
        {
          onSuccess: () => {
            toast.success('Bed updated successfully!')
            navigate({ to: '/dashboard/beds' })
          },
          onError: (error) => {
            console.error('Failed to update bed:', error)
            toast.error('Failed to update bed')
          },
        }
      )
    } else {
      createBed.mutate(payload, {
        onSuccess: () => {
          toast.success('Bed created successfully!')
          navigate({ to: '/dashboard/beds' })
        },
        onError: (error) => {
          console.error('Failed to create bed:', error)
          toast.error('Failed to create bed')
        },
      })
    }
  }

  const bedTypes = [
    { value: 'GENERAL', label: 'General' },
    { value: 'ICU', label: 'ICU' },
    { value: 'PRIVATE', label: 'Private' },
    { value: 'EMERGENCY', label: 'Emergency' },
  ]

  const wards = [
    { value: 'Intensive Care Unit', label: 'Intensive Care Unit' },
    { value: 'Emergency Room', label: 'Emergency Room' },
    { value: 'General Ward', label: 'General Ward' },
    { value: 'Pediatric Ward', label: 'Pediatric Ward' },
    { value: 'Maternity Ward', label: 'Maternity Ward' },
    { value: 'Surgical Ward', label: 'Surgical Ward' },
  ]

  return (
    <Card className='w-full p-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <FormField
              control={form.control}
              name='bedNumber'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Bed Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Enter bed number (e.g., ICU-001)'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='bedType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Bed Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select bed type' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bedTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name='ward'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Ward</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select ward' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.value} value={ward.value}>
                          {ward.label}
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
              name='pricePerDay'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Price Per Day (Rs)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      value={field.value}
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
              onClick={() => navigate({ to: '/dashboard/beds' })}
            >
              Back
            </Button>
            <Button
              type='submit'
              isLoading={createBed.isPending || updateBed.isPending}
              loadingText={isEdit ? 'Updating bed...' : 'Creating bed...'}
            >
              {isEdit ? 'Update Bed' : 'Create Bed'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}

export default BedForm
