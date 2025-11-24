import { useQuery, useMutation } from '@tanstack/react-query'
import {
  RegisterUserRequest,
  LoginRequest,
  AuthResponse,
  ProfileResponse,
} from '@/schema/auth-schema'
import { api } from '../client'

export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterUserRequest) =>
      api.post<AuthResponse>('/auth/register', userData),
  })
}

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      api.post<AuthResponse>('/auth/login', credentials),
  })
}

export const useProfile = () => {
  return useQuery<ProfileResponse, Error>({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<ProfileResponse>('/auth/profile')
      return data
    },
  })
}
