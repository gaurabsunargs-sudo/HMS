import { useState } from 'react'
import { MedicalRecord } from '@/schema/medical-records-schema'
import {
  Mail,
  UserIcon,
  Hash,
  Briefcase,
  Calendar,
  Stethoscope,
  FileText,
  HeartPulse,
  ClipboardList,
  Download,
  Eye,
  File,
  Image,
} from 'lucide-react'
import { getImageUrl } from '@/lib/image-utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import FilePreview from '@/components/file-preview'

interface ViewDataProps {
  viewData: MedicalRecord
}

const ViewData = ({ viewData }: ViewDataProps) => {
  const [previewFile, setPreviewFile] = useState<any>(null)

  if (!viewData) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <p className='text-gray-500'>No medical record data available</p>
      </div>
    )
  }

  const {
    id,
    symptoms,
    diagnosis,
    treatment,
    notes,
    attachments,
    createdAt,
    updatedAt,
    patient,
    doctor,
  } = viewData

  // Format dates
  const createdDate = new Date(createdAt).toLocaleDateString()
  const updatedDate = new Date(updatedAt).toLocaleDateString()

  const getFileIcon = (path: string) => {
    const ext = path.toLowerCase().split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext || '')) {
      return <Image className='h-4 w-4 text-blue-600' />
    }
    if (ext === 'pdf') {
      return <FileText className='h-4 w-4 text-red-600' />
    }
    return <File className='h-4 w-4 text-gray-600' />
  }

  const getFileName = (path: string) => {
    return path.split('/').pop() || path
  }

  const handlePreview = (path: string) => {
    setPreviewFile({
      path,
      filename: getFileName(path),
      originalname: getFileName(path),
    })
  }

  return (
    <div className='space-y-6'>
      {/* Medical Record Header */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-2xl'>Medical Record Details</CardTitle>
              <CardDescription>Record ID: {id}</CardDescription>
            </div>
            <div className='mt-4 flex items-center space-x-2 md:mt-0'>
              <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                ACTIVE
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
          <CardTitle className='flex items-center'>
            <HeartPulse className='mr-2 h-5 w-5' />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='flex items-start md:col-span-2'>
              <ClipboardList className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Symptoms</p>
                <p className='font-semibold'>{symptoms}</p>
              </div>
            </div>

            <div className='flex items-start md:col-span-2'>
              <HeartPulse className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Diagnosis</p>
                <p className='font-semibold'>{diagnosis}</p>
              </div>
            </div>

            <div className='flex items-start md:col-span-2'>
              <Stethoscope className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Treatment</p>
                <p className='font-semibold'>{treatment}</p>
              </div>
            </div>

            {notes && (
              <div className='flex items-start md:col-span-2'>
                <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Notes</p>
                  <p className='font-semibold'>{notes}</p>
                </div>
              </div>
            )}

            {attachments && attachments.length > 0 && (
              <div className='flex items-start md:col-span-2'>
                <FileText className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div className='w-full'>
                  <p className='mb-3 text-sm font-medium text-gray-500'>
                    Attachments ({attachments.length})
                  </p>
                  <div className='space-y-2'>
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
                      >
                        <div className='flex items-center space-x-3'>
                          {getFileIcon(attachment)}
                          <span className='text-sm font-medium text-gray-900'>
                            {getFileName(attachment)}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          {getFileName(attachment).match(
                            /\.(jpg|jpeg|png|gif|bmp|webp|pdf)$/i
                          ) && (
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handlePreview(attachment)}
                              className='h-8 w-8 p-0'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() =>
                              window.open(getImageUrl(attachment), '_blank')
                            }
                            className='h-8 w-8 p-0'
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Created At</p>
                <p className='font-semibold'>{createdDate}</p>
              </div>
            </div>

            <div className='flex items-start'>
              <Calendar className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-500'>Updated At</p>
                <p className='font-semibold'>{updatedDate}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Patient Information */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <UserIcon className='mr-2 h-5 w-5' />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Name</p>
                  <p className='font-semibold'>{patient?.user?.firstName}</p>
                  <p className='font-semibold'>{patient?.user?.middleName}</p>
                  <p className='font-semibold'>{patient?.user?.lastName}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>{patient?.user?.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Patient ID
                  </p>
                  <p className='text-sm font-semibold'>{patient.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctor Information */}
        <Card>
          <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50'>
            <CardTitle className='flex items-center'>
              <Stethoscope className='mr-2 h-5 w-5' />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex items-start'>
                <UserIcon className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Name</p>
                  <p className='font-semibold'>Dr. {doctor?.user.firstName}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Mail className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Email</p>
                  <p className='font-semibold'>{doctor?.user.email}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Hash className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>Doctor ID</p>
                  <p className='text-sm font-semibold'>{doctor.id}</p>
                </div>
              </div>

              <div className='flex items-start'>
                <Briefcase className='mt-0.5 mr-3 h-5 w-5 text-blue-600' />
                <div>
                  <p className='text-sm font-medium text-gray-500'>
                    Specialization
                  </p>
                  <p className='font-semibold'>{doctor.specialization}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  )
}

export default ViewData
