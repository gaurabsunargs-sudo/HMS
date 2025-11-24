import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ADToBS, BSToAD } from 'bikram-sambat-js'
import { Button } from '@/components/ui/button'
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
import { NepaliDatePicker } from '@/components/ui/nepali-date-picker'

const formSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  birthDate: z.date({
    required_error: 'A date of birth is required.',
  }),
  nepaliDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Please select a valid Nepali date in YYYY-MM-DD format',
  }),
})

export default function UserForm() {
  const [submittedData, setSubmittedData] = React.useState<z.infer<
    typeof formSchema
  > | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: 'gaurab',
      birthDate: new Date(),
      nepaliDate: ADToBS(new Date()),
    },
  })

  // Handle AD date change
  const handleADDateChange = (date: Date) => {
    form.setValue('birthDate', date)
    const bsDate = ADToBS(date)
    form.setValue('nepaliDate', bsDate)
  }

  // Handle BS date change
  const handleBSDateChange = (bsDate: string) => {
    form.setValue('nepaliDate', bsDate)
    try {
      const adDate = new Date(BSToAD(bsDate))
      form.setValue('birthDate', adDate)
    } catch (error) {
      console.error('Invalid BS date conversion:', error)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmittedData(values)
  }

  return (
    <div className='mx-auto max-w-md space-y-8'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder='shadcn' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='birthDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel htmlFor='birthDate'>Gregorian Date</FormLabel>
                <FormControl>
                  <DatePicker
                    {...field}
                    onChange={(date) => {
                      if (date) {
                        handleADDateChange(date)
                      }
                    }}
                    placeholder='Select a date'
                    id='birthDate'
                    disableFuture={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='nepaliDate'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <FormLabel htmlFor='nepaliDate'>Nepali Date</FormLabel>
                <FormControl>
                  <NepaliDatePicker
                    {...field}
                    onChange={(value) => {
                      if (value) {
                        handleBSDateChange(value)
                      }
                    }}
                    locale='en'
                    placeholder='Select a date'
                    id='nepaliDate'
                    disableFuture={false}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type='submit'>Submit</Button>
        </form>
      </Form>

      {submittedData && (
        <div className='bg-muted mt-8 rounded-lg border p-4'>
          <h3 className='mb-2 text-lg font-semibold'>Submitted Data:</h3>
          <pre className='bg-background rounded p-4 text-sm'>
            {JSON.stringify(
              {
                ...submittedData,
                birthDate: submittedData.birthDate.toLocaleDateString(),
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  )
}
