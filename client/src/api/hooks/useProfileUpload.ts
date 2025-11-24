import Cookies from 'js-cookie'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { decryptData, encryptData } from '@/lib/encryptionUtils'
import { api } from '../client'

export const useProfileUpload = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('profile', file)

      const encryptedToken = Cookies.get('hms-token')
      const token = encryptedToken
        ? (decryptData(encryptedToken) as string)
        : ''

      const response = await api.put('/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data
    },
    onSuccess: (data) => {
      // Invalidate and refetch profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] })

      // Update user data in cookies if needed
      const userData = decryptData(Cookies.get('hms-user') || '')
      if (userData) {
        const updatedUserData = { ...userData, profile: data.data.profile }
        Cookies.set('hms-user', encryptData(updatedUserData))
      }
    },
    onError: (error) => {
      console.error('Profile upload failed:', error)
    },
  })
}
