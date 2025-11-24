import { serverUrl } from '@/api/server-url'

// Get the image base URL from environment
const getImageBaseUrl = () => {
  return (
    import.meta.env.VITE_API_BASE_IMAGE_URL || serverUrl.replace('/api', '')
  )
}

/**
 * Converts a relative image path to a full URL
 * @param imagePath - The relative image path (e.g., "/storage/profile/...")
 * @returns The full URL for the image
 */
export const getImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) return ''

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath

  // For images, we need to use the base server URL without /api
  // serverUrl is http://localhost:5000/api, but images are served at http://localhost:5000
  const baseUrl = getImageBaseUrl()

  // Construct full URL
  return `${baseUrl}/${cleanPath}`
}

/**
 * Gets the profile image URL with fallback
 * @param profilePath - The profile image path from the database
 * @returns The full URL for the profile image or empty string
 */
export const getProfileImageUrl = (profilePath?: string | null): string => {
  return getImageUrl(profilePath)
}
