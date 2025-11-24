import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  useAllTestimonials,
  useToggleTestimonialApproval,
  useDeleteTestimonial,
} from '@/api/hooks/useTestimonials'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const TestimonialsManagement = () => {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [approvedFilter, setApprovedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const queryClient = useQueryClient()
  const toggleApproval = useToggleTestimonialApproval()
  const deleteTestimonial = useDeleteTestimonial()

  const { data, isLoading, error } = useAllTestimonials({
    page,
    limit,
    approved:
      approvedFilter === 'all' ? undefined : approvedFilter === 'approved',
  })

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await toggleApproval.mutateAsync({ id, isApproved: !currentStatus })
      toast.success(
        `Testimonial ${!currentStatus ? 'approved' : 'disapproved'} successfully`
      )
    } catch (error) {
      toast.error('Failed to update testimonial status')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteTestimonial.mutateAsync(id)
        toast.success('Testimonial deleted successfully')
      } catch (error) {
        toast.error('Failed to delete testimonial')
      }
    }
  }

  const columns = [
    {
      accessorKey: 'patientName',
      header: 'Patient Name',
    },
    {
      accessorKey: 'patientRole',
      header: 'Role',
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }: any) => (
        <span className='text-gray-600'>
          {row.original.department || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className='flex items-center'>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < row.original.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          ))}
          <span className='ml-1 text-sm text-gray-600'>
            ({row.original.rating})
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'testimonialText',
      header: 'Testimonial',
      cell: ({ row }: any) => (
        <div className='max-w-xs truncate' title={row.original.testimonialText}>
          {row.original.testimonialText}
        </div>
      ),
    },
    {
      accessorKey: 'isApproved',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge variant={row.original.isApproved ? 'default' : 'secondary'}>
          {row.original.isApproved ? 'Approved' : 'Pending'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ row }: any) => (
        <span className='text-sm text-gray-600'>
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() =>
              handleToggleApproval(row.original.id, row.original.isApproved)
            }
            className={
              row.original.isApproved
                ? 'border-red-500 text-red-500 hover:bg-red-50'
                : 'border-green-500 text-green-500 hover:bg-green-50'
            }
          >
            {row.original.isApproved ? (
              <>
                <EyeOff className='mr-1 h-3 w-3' />
                Hide
              </>
            ) : (
              <>
                <Eye className='mr-1 h-3 w-3' />
                Approve
              </>
            )}
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handleDelete(row.original.id)}
            className='border-red-500 text-red-500 hover:bg-red-50'
          >
            <Trash2 className='h-3 w-3' />
          </Button>
        </div>
      ),
    },
  ]

  const filteredData =
    data?.data?.filter(
      (testimonial: any) =>
        testimonial.patientName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimonial.patientRole
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimonial.testimonialText
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || []

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-gray-500'>Loading testimonials...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-red-500'>Failed to load testimonials</div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Testimonials Management
          </h1>
          <p className='text-gray-600'>
            Manage patient testimonials and their approval status
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
              <Input
                placeholder='Search testimonials...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full sm:w-64'
              />
              <Select value={approvedFilter} onValueChange={setApprovedFilter}>
                <SelectTrigger className='w-full sm:w-48'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Testimonials</SelectItem>
                  <SelectItem value='approved'>Approved Only</SelectItem>
                  <SelectItem value='pending'>Pending Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex items-center space-x-2'>
              <span className='text-sm text-gray-600'>Show:</span>
              <Select
                value={limit.toString()}
                onValueChange={(value) => setLimit(Number(value))}
              >
                <SelectTrigger className='w-20'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='10'>10</SelectItem>
                  <SelectItem value='25'>25</SelectItem>
                  <SelectItem value='50'>50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-blue-100'>
                <CheckCircle className='h-6 w-6 text-blue-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>
                  Total Testimonials
                </p>
                <p className='text-2xl font-bold text-gray-900'>
                  {data?.meta?.pagination?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
                <Eye className='h-6 w-6 text-green-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Approved</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {data?.data?.filter((t: any) => t.isApproved).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center'>
              <div className='flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100'>
                <XCircle className='h-6 w-6 text-yellow-600' />
              </div>
              <div className='ml-4'>
                <p className='text-sm font-medium text-gray-600'>Pending</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {data?.data?.filter((t: any) => !t.isApproved).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData}
            pagination={{
              page,
              limit,
              total: filteredData.length,
              onPageChange: setPage,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default TestimonialsManagement
