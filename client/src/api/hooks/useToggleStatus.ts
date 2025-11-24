import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-status`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
