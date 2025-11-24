import { AxiosError } from 'axios'
import { toast } from './use-toast'

export function useErrorHandler() {
  const handleError = (
    error: unknown,
    fallbackMessage = 'Something went wrong.'
  ) => {
    let message = fallbackMessage
    let statusCode: number | undefined
    if (error instanceof AxiosError) {
      const response = error.response

      statusCode = response?.status

      const errorData = response?.data
      if (errorData) {
        if (typeof errorData === 'string') {
          message = errorData
        } else if (typeof errorData === 'object') {
          message =
            errorData?.error ||
            errorData?.message ||
            error.message ||
            fallbackMessage
        }
      } else {
        message = error.message || fallbackMessage
      }

      if (statusCode === 401) message = 'Unauthorized. Please log in again.'
      else if (statusCode === 403)
        message = 'Forbidden. You don’t have permission.'
      else if (statusCode === 404)
        message = 'Not Found. The resource does not exist.'
      else if (statusCode === 500)
        message = 'Server Error. Please try again later.'
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'issues' in error
    ) {
      const issues = (error as any).issues
      if (Array.isArray(issues)) {
        message = issues.map((issue: any) => issue.message).join(', ')
      }
    } else if (error instanceof Error) {
      message = error.message || fallbackMessage
    }

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })

    console.error('Handled error:', error)
  }

  return { handleError }
}
