import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import admissionListReducer from './slices/admissionListSlice'
import appointmentListReducer from './slices/appointmentListSlice'
import authReducer from './slices/authSlice'
import bedListReducer from './slices/bedListSlice'
import billListReducer from './slices/billListSlice'
import breadCrumbReducer from './slices/breadcrumbSlice'
import doctorListReducer from './slices/doctorListSlice'
import equipmentListReducer from './slices/equipmentListSlice'
import inventoryListReducer from './slices/inventoryListSlice'
import medicalRecordListReducer from './slices/medicalRecordListSlice'
import patientListReducer from './slices/patientListSlice'
import paymentListReducer from './slices/paymentListSlice'
import prescriptionListReducer from './slices/prescriptionListSlice'
import uiReducer from './slices/uiSlice'
import userListReducer from './slices/userListSlice'
import userReducer from './slices/userSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,

    ui: uiReducer,
    breadcrumb: breadCrumbReducer,

    user: userReducer,
    userList: userListReducer,

    doctorList: doctorListReducer,

    patientList: patientListReducer,

    appointmentList: appointmentListReducer,
    medicalRecordList: medicalRecordListReducer,
    prescriptionList: prescriptionListReducer,

    admissionList: admissionListReducer,
    bedList: bedListReducer,

    equipmentList: equipmentListReducer,

    billList: billListReducer,
    paymentList: paymentListReducer,

    inventoryList: inventoryListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export default store
