import { Bed } from '@/schema'
import {
  Hash,
  Calendar,
  BedDouble,
  DollarSign,
  MapPin,
  BadgeCheck,
  BadgeX,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ViewDataProps {
  viewData: Bed
}

const ViewData = ({ viewData }: ViewDataProps) => {
  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No bed data available</p>
      </div>
    )
  }

  const { id, bedNumber, bedType, ward, isOccupied, pricePerDay, createdAt } =
    viewData

  // Format date
  const created = new Date(createdAt).toLocaleDateString()

  return (
    <div className='space-y-6'>
      {/* Bed Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Bed Details</CardTitle>
              <CardDescription>Bed ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge
                variant='secondary'
                className={
                  isOccupied
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }
              >
                {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bed Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <BedDouble className='mr-2 h-5 w-5' />
            Bed Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start'>
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bed Number</p>
                <p className='font-semibold'>{bedNumber}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <BedDouble className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bed Type</p>
                <p className='font-semibold capitalize'>{bedType}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <MapPin className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Ward</p>
                <p className='font-semibold'>{ward}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <DollarSign className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Price Per Day
                </p>
                <p className='font-semibold'>${pricePerDay}/day</p>
              </div>
            </div>

            <div className='flex items-start'>
              {isOccupied ? (
                <BadgeX className='mt-0.5 mr-3 h-5 w-5 text-red-600' />
              ) : (
                <BadgeCheck className='mt-0.5 mr-3 h-5 w-5 text-green-600' />
              )}
              <div>
                <p className='text-sm font-medium text-gray-500'>Status</p>
                <p className='font-semibold'>
                  {isOccupied ? 'Occupied' : 'Available'}
                </p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Created At</p>
                <p className='font-semibold'>{created}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <Hash className='mr-2 h-5 w-5' />
            Additional Details
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4'>
            <div className='flex items-start'>
              <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Bed ID</p>
                <p className='font-mono text-sm font-semibold'>{id}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>
                  Full Created Date
                </p>
                <p className='font-semibold'>
                  {new Date(createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            {isOccupied ? (
              <BadgeX className='mr-2 h-5 w-5 text-red-600' />
            ) : (
              <BadgeCheck className='mr-2 h-5 w-5 text-green-600' />
            )}
            Status Summary
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='rounded-lg bg-gray-50 p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-700'>
                  Current Status
                </p>
                <p
                  className={`text-lg font-bold ${
                    isOccupied ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {isOccupied ? 'Occupied' : 'Available'}
                </p>
              </div>
              <Badge
                variant='secondary'
                className={
                  isOccupied
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }
              >
                {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
              </Badge>
            </div>

            {isOccupied && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-sm text-gray-600'>
                  This bed is currently occupied. Please check the patient
                  management system for details.
                </p>
              </div>
            )}

            {!isOccupied && (
              <div className='mt-4 border-t pt-4'>
                <p className='text-sm text-gray-600'>
                  This bed is available for new patients. Ready for admission.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ViewData
