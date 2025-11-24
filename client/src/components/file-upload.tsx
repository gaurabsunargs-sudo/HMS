import { useState, useCallback } from 'react'
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  Trash2,
  Eye,
  Download,
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { api } from '@/api/client'
import { getImageUrl } from '@/lib/image-utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import FilePreview from './file-preview'

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  existingFiles?: string[]
  onFileDelete?: (filename: string) => void
  disabled?: boolean
}

export interface UploadedFile {
  filename: string
  originalname: string
  mimetype: string
  size: number
  path: string
}

const FileUpload = ({
  onFilesUploaded,
  existingFiles = [],
  onFileDelete,
  disabled = false,
}: FileUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewFile, setPreviewFile] = useState<any>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        acceptedFiles.forEach((file) => {
          formData.append('files', file)
        })

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 100)

        const response = await api.post('/medical-records/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        const result = response.data

        if (result.success) {
          const newFiles = result.data.files
          setUploadedFiles((prev) => [...prev, ...newFiles])
          onFilesUploaded([...uploadedFiles, ...newFiles])
          toast.success(`Successfully uploaded ${newFiles.length} file(s)`)
        } else {
          throw new Error(result.message || 'Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error('Failed to upload files')
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
      }
    },
    [uploadedFiles, onFilesUploaded]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [
        '.xlsx',
      ],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
    disabled: disabled || isUploading,
  })

  const handleFileDelete = async (filename: string) => {
    try {
      const response = await api.delete(`/medical-records/files/${filename}`)

      setUploadedFiles((prev) =>
        prev.filter((file) => file.filename !== filename)
      )
      onFileDelete?.(filename)
      toast.success('File deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete file')
    }
  }

  const handlePreview = (file: any) => {
    setPreviewFile(file)
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className='h-4 w-4' />
    if (mimetype === 'application/pdf') return <FileText className='h-4 w-4' />
    return <File className='h-4 w-4' />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const allFiles = [
    ...uploadedFiles,
    ...existingFiles.map((path) => ({
      path,
      filename: path.split('/').pop() || '',
      originalname: path.split('/').pop() || '',
      mimetype: '',
      size: 0,
    })),
  ]

  return (
    <div className='space-y-4'>
      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed p-6 transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <div {...getRootProps()} className='text-center'>
          <input {...getInputProps()} />
          <Upload className='mx-auto mb-4 h-12 w-12 text-gray-400' />
          <p className='mb-2 text-lg font-medium text-gray-900'>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className='mb-4 text-sm text-gray-500'>or click to select files</p>
          <div className='space-y-1 text-xs text-gray-400'>
            <p>Supported formats: Images, PDF, Word, Excel, Text files</p>
            <p>Maximum file size: 10MB per file</p>
            <p>Maximum files: 10</p>
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <Card className='p-4'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-sm font-medium'>Uploading files...</span>
            <span className='text-sm text-gray-500'>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className='w-full' />
        </Card>
      )}

      {/* Uploaded Files */}
      {allFiles.length > 0 && (
        <Card className='p-4'>
          <h3 className='mb-4 text-lg font-medium'>Attached Files</h3>
          <div className='space-y-3'>
            {allFiles.map((file, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg bg-gray-50 p-3'
              >
                <div className='flex items-center space-x-3'>
                  {getFileIcon(file.mimetype || '')}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-gray-900'>
                      {file.originalname || file.filename}
                    </p>
                    {file.size && (
                      <p className='text-xs text-gray-500'>
                        {formatFileSize(file.size)}
                      </p>
                    )}
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  {file.mimetype?.startsWith('image/') && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handlePreview(file)}
                      className='h-8 w-8 p-0'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() =>
                      window.open(getImageUrl(file.path), '_blank')
                    }
                    className='h-8 w-8 p-0'
                  >
                    <Download className='h-4 w-4' />
                  </Button>
                  {onFileDelete && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleFileDelete(file.filename)}
                      className='h-8 w-8 p-0 text-red-600 hover:text-red-700'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  )
}

export default FileUpload
