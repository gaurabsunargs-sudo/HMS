import { useQuery } from '@tanstack/react-query'
import { api } from '../client'

export const useSymptomSuggestions = (selectedSymptoms: string[]) => {
  return useQuery({
    queryKey: ['symptomSuggestions', selectedSymptoms],
    queryFn: async () => {
      if (selectedSymptoms.length === 0) {
        return { suggested_symptoms: [] }
      }
      
      const { data } = await api.post('/ai/suggest-symptoms', {
        selected_symptoms: selectedSymptoms,
      })
      return data
    },
    enabled: selectedSymptoms.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
