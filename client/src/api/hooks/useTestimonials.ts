import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../client'

// Types
export interface Testimonial {
  id: string
  patientName: string
  patientRole: string
  testimonialText: string
  rating: number
  department?: string
  userId?: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}

export interface CreateTestimonialRequest {
  patientName: string
  patientRole: string
  testimonialText: string
  rating: number
  department?: string
}

export interface UpdateTestimonialRequest {
  patientName?: string
  patientRole?: string
  testimonialText?: string
  rating?: number
  department?: string
  isApproved?: boolean
}

// API functions
export const testimonialApi = {
  // Get approved testimonials for website display
  getApprovedTestimonials: async (): Promise<Testimonial[]> => {
    const response = await api.get('/testimonials/approved')
    return response.data.data
  },

  // Get all testimonials (admin only)
  getAllTestimonials: async (params?: {
    page?: number
    limit?: number
    approved?: boolean
    userId?: string
  }): Promise<{ data: Testimonial[]; meta: any }> => {
    const response = await api.get('/testimonials', { params })
    return response.data
  },

  // Get testimonial by ID
  getTestimonialById: async (id: string): Promise<Testimonial> => {
    const response = await api.get(`/testimonials/${id}`)
    return response.data.data
  },

  // Create testimonial
  createTestimonial: async (
    data: CreateTestimonialRequest
  ): Promise<Testimonial> => {
    const response = await api.post('/testimonials', data)
    return response.data.data
  },

  // Update testimonial
  updateTestimonial: async (
    id: string,
    data: UpdateTestimonialRequest
  ): Promise<Testimonial> => {
    const response = await api.put(`/testimonials/${id}`, data)
    return response.data.data
  },

  // Delete testimonial
  deleteTestimonial: async (id: string): Promise<void> => {
    await api.delete(`/testimonials/${id}`)
  },

  // Toggle testimonial approval
  toggleApproval: async (
    id: string,
    isApproved: boolean
  ): Promise<Testimonial> => {
    const response = await api.patch(`/testimonials/${id}/approve`, {
      isApproved,
    })
    return response.data.data
  },
}

// React Query hooks
export const useApprovedTestimonials = () => {
  return useQuery({
    queryKey: ['testimonials', 'approved'],
    queryFn: testimonialApi.getApprovedTestimonials,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAllTestimonials = (params?: {
  page?: number
  limit?: number
  approved?: boolean
  userId?: string
}) => {
  return useQuery({
    queryKey: ['testimonials', 'all', params],
    queryFn: () => testimonialApi.getAllTestimonials(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useTestimonialById = (id: string) => {
  return useQuery({
    queryKey: ['testimonials', id],
    queryFn: () => testimonialApi.getTestimonialById(id),
    enabled: !!id,
  })
}

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testimonialApi.createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })
}

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateTestimonialRequest
    }) => testimonialApi.updateTestimonial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
      queryClient.invalidateQueries({ queryKey: ['testimonials', id] })
    },
  })
}

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: testimonialApi.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })
}

export const useToggleTestimonialApproval = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) =>
      testimonialApi.toggleApproval(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    },
  })
}
