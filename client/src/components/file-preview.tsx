import { useState } from 'react'
import { X, Download, FileText, Image, File } from 'lucide-react'
import { getImageUrl } from '@/lib/image-utils'
import { Button } from '@/components/ui/button'

interface FilePreviewProps {
  file: {
    path: string
    filename: string
    originalname?: string
    mimetype?: string
    size?: number
  }
  onClose: () => void
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isImage =
    file.mimetype?.startsWith('image/') ||
    file.path.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)

  const isPDF =
    file.mimetype === 'application/pdf' ||
    file.path.toLowerCase().endsWith('.pdf')

  const handleLoad = () => {
    setIsLoading(false)
    setError(null)
  }

  const handleError = () => {
    setIsLoading(false)
    setError('Failed to load file')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className='bg-opacity-50 fixed inset-0 z-[5000000] flex items-center justify-center bg-black'>
      <div className='mx-4 max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white'>
        {/* Header */}
        <div className='flex items-center justify-between border-b p-4'>
          <div className='flex items-center space-x-2'>
            {isImage ? (
              <Image className='h-5 w-5 text-blue-600' />
            ) : isPDF ? (
              <FileText className='h-5 w-5 text-red-600' />
            ) : (
              <File className='h-5 w-5 text-gray-600' />
            )}
            <span className='font-medium'>
              {file.originalname || file.filename}
            </span>
            {file.size && (
              <span className='text-sm text-gray-500'>
                ({formatFileSize(file.size)})
              </span>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => window.open(getImageUrl(file.path), '_blank')}
            >
              <Download className='h-4 w-4' />
            </Button>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto p-4'>
          {isLoading && (
            <div className='flex h-64 items-center justify-center'>
              <div className='border-primary h-8 w-8 animate-spin rounded-full border-b-2'></div>
            </div>
          )}

          {error && (
            <div className='flex h-64 items-center justify-center text-red-600'>
              {error}
            </div>
          )}

          {isImage && (
            <div className='flex justify-center'>
              <img
                src={getImageUrl(file.path)}
                alt={file.originalname || file.filename}
                className='max-h-[70vh] max-w-full object-contain'
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: isLoading ? 'none' : 'block' }}
              />
            </div>
          )}

          {isPDF && (
            <div className='flex h-[70vh] justify-center'>
              <iframe
                src={getImageUrl(file.path)}
                className='h-full w-full rounded border'
                onLoad={handleLoad}
                onError={handleError}
                style={{ display: isLoading ? 'none' : 'block' }}
              />
            </div>
          )}

          {!isImage && !isPDF && (
            <div className='flex h-64 items-center justify-center text-gray-500'>
              <div className='text-center'>
                <File className='mx-auto mb-4 h-16 w-16 text-gray-400' />
                <p>Preview not available for this file type</p>
                <p className='text-sm'>Click download to view the file</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilePreview
