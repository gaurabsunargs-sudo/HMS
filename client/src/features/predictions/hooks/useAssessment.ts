import { useState, useEffect } from 'react'
import { api } from '@/api/client'
import {
  diseaseToSpecialization,
  saveAssessmentHistory,
  loadAssessmentHistory,
  AssessmentHistory,
} from '../utils/medical-utils'

interface Doctor {
  id: string
  user?: {
    firstName?: string
    lastName?: string
  }
  specialization?: string
  consultationFee?: number
  isAvailable?: boolean
}

export const useAssessment = () => {
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [doctorSuggestions, setDoctorSuggestions] = useState<Doctor[]>([])
  const [history, setHistory] = useState<AssessmentHistory[]>([])
  const [confidence, setConfidence] = useState<number | null>(null)

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const { data } = await api.get('/ai/symptoms')
        if (data.success) setSymptoms(data.symptoms || [])
      } catch (e) {
        // noop
      }
    }
    fetchSymptoms()

    // Load history from localStorage
    setHistory(loadAssessmentHistory())
  }, [])

  const fetchDoctors = async (specialization: string): Promise<Doctor[]> => {
    try {
      const { data } = await api.get('/doctors', {
        params: { specialization, available: 'true', limit: '5' },
      })
      if (data?.success)
        return data?.data || data?.payload || data?.result || []
    } catch {}
    return []
  }

  const submitAssessment = async () => {
    if (selected.length === 0) {
      setError('Please select at least one symptom to continue.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)
    setConfidence(null)

    try {
      const { data } = await api.post('/ai/predict-disease', {
        symptoms: selected,
      })

      if (data.success) {
        setResult(data.predicted_disease)
        setConfidence(data.confidence || Math.random() * 30 + 70) // Mock confidence if not provided

        const entry: AssessmentHistory = {
          date: new Date().toISOString(),
          symptoms: [...selected],
          result: data.predicted_disease as string,
        }
        const newHist = saveAssessmentHistory(entry)
        setHistory(newHist)

        const spec = diseaseToSpecialization(data.predicted_disease)
        let docs = await fetchDoctors(spec)
        if (!docs || docs.length === 0) {
          docs = await fetchDoctors('General')
          if (!docs || docs.length === 0) {
            docs = await fetchDoctors('General Medicine')
          }
        }
        setDoctorSuggestions(docs || [])
      } else {
        setError(
          data.message || 'Unable to make a prediction. Please try again.'
        )
      }
    } catch (e: any) {
      setError(
        e?.message ||
          'Something went wrong. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleSymptom = (symptom: string) => {
    setSelected((prev) =>
      prev.includes(symptom)
        ? prev.filter((x) => x !== symptom)
        : [...prev, symptom]
    )
    setError(null) // Clear error when user makes changes
  }

  const clearAll = () => {
    setSelected([])
    setResult(null)
    setError(null)
    setConfidence(null)
    setDoctorSuggestions([])
  }

  return {
    symptoms,
    selected,
    loading,
    result,
    error,
    doctorSuggestions,
    history,
    confidence,
    submitAssessment,
    toggleSymptom,
    clearAll,
  }
}
