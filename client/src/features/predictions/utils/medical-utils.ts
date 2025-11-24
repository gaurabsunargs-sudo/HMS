/**
 * Medical utility functions for symptom assessment
 */

export const diseaseToSpecialization = (disease: string): string => {
  const map: Record<string, string> = {
    'Fungal infection': 'Dermatology',
    Allergy: 'Allergy & Immunology',
    GERD: 'Gastroenterology',
    'Chronic cholestasis': 'Gastroenterology',
    'Drug Reaction': 'General Medicine',
    'Peptic ulcer disease': 'Gastroenterology',
    AIDS: 'Infectious Disease',
    Diabetes: 'Endocrinology',
    Gastroenteritis: 'Gastroenterology',
    'Bronchial Asthma': 'Pulmonology',
    Hypertension: 'Cardiology',
    Migraine: 'Neurology',
    'Cervical spondylosis': 'Orthopedics',
    Malaria: 'Infectious Disease',
    Typhoid: 'Infectious Disease',
    Jaundice: 'Hepatology',
    'Hepatitis A': 'Hepatology',
    'Hepatitis B': 'Hepatology',
    'Hepatitis C': 'Hepatology',
    'Hepatitis D': 'Hepatology',
    'Hepatitis E': 'Hepatology',
    Dengue: 'Infectious Disease',
    'Chicken pox': 'Infectious Disease',
    'COVID-19': 'Infectious Disease',
  }
  return map[disease] || 'General Medicine'
}

export interface AssessmentHistory {
  date: string
  symptoms: string[]
  result: string
}

export const saveAssessmentHistory = (
  entry: AssessmentHistory
): AssessmentHistory[] => {
  try {
    const existing = localStorage.getItem('prediction_history')
    const history: AssessmentHistory[] = existing ? JSON.parse(existing) : []
    const newHistory = [entry, ...history].slice(0, 10)
    localStorage.setItem('prediction_history', JSON.stringify(newHistory))
    return newHistory
  } catch {
    return []
  }
}

export const loadAssessmentHistory = (): AssessmentHistory[] => {
  try {
    const raw = localStorage.getItem('prediction_history')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
