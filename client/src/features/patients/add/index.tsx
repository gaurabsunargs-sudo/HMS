import { useState } from 'react'
import PageHeader from '@/components/pageHeader'
import PatientEnrollmentForm from './patient-enrollment-form'
import PatientRegisterForm from './patient-register-form'

const AddPatient = () => {
  const [patientType, setPatientType] = useState<'new' | 'existing'>('new')

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Add Patient'
        description='This page allows you to add a new patient.'
      />

      <div className='flex gap-6'>
        <label
          className={`flex-1 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center shadow-sm transition-all duration-200 ${
            patientType === 'new'
              ? 'border-solid border-purple-500 bg-purple-50'
              : 'border-gray-300 bg-white hover:border-purple-400'
          }`}
        >
          <input
            type='radio'
            name='patientType'
            value='new'
            checked={patientType === 'new'}
            onChange={() => setPatientType('new')}
            className='hidden'
          />
          <div className='text-lg font-semibold text-gray-800'>New Patient</div>
          <p className='mt-2 text-sm text-gray-500'>
            Register a new patient in the system
          </p>
        </label>

        <label
          className={`flex-1 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center shadow-sm transition-all duration-200 ${
            patientType === 'existing'
              ? 'border-solid border-purple-500 bg-purple-50'
              : 'border-gray-300 bg-white hover:border-purple-400'
          }`}
        >
          <input
            type='radio'
            name='patientType'
            value='existing'
            checked={patientType === 'existing'}
            onChange={() => setPatientType('existing')}
            className='hidden'
          />
          <div className='text-lg font-semibold text-gray-800'>
            Existing Patient
          </div>
          <p className='mt-2 text-sm text-gray-500'>
            Select from existing patient records
          </p>
        </label>
      </div>

      {patientType === 'new' ? (
        <PatientRegisterForm />
      ) : (
        <PatientEnrollmentForm />
      )}
    </div>
  )
}

export default AddPatient
