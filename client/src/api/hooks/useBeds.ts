import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Bed,
  BedsResponse,
  BedResponse,
  CreateBedRequest,
  UpdateBedRequest,
} from '@/schema/beds-schema'
import { api } from '../client'

export const useBeds = ({
  page = 1,
  limit = 10,
  search = '',
}: {
  page?: number
  limit?: number
  search?: string
}) => {
  return useQuery<BedsResponse, Error>({
    queryKey: ['beds', page, limit, search],
    queryFn: async () => {
      const { data } = await api.get<BedsResponse>('/beds', {
        params: {
          page,
          limit,
          search,
        },
      })
      return data
    },
  })
}

export const useBedsSelect = () => {
  return useQuery<BedsResponse, Error>({
    queryKey: ['beds', 'select'],
    queryFn: async () => {
      const { data } = await api.get<BedsResponse>('/beds/select')
      return data
    },
  })
}

export const useBedById = (id: string | null) => {
  return useQuery<Bed, Error>({
    queryKey: ['bed', id],
    queryFn: async () => {
      const { data } = await api.get<BedResponse>(`/beds/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

export const useCreateBed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (newBed: CreateBedRequest) => api.post('/beds', newBed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}

export const useUpdateBed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      updatedBed,
    }: {
      id: string
      updatedBed: UpdateBedRequest
    }) => api.put(`/beds/${id}`, updatedBed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}

export const useDeleteBed = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/beds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beds'] })
    },
  })
}
