// Import necessary dependencies
import { configureStore } from '@reduxjs/toolkit';
import { authPatientReducer } from './reducers/patient/authReducers';
import { authDoctorReducer } from './reducers/doctor/authReducers'
import { doctorProfileReducer } from './reducers/doctor/doctorProfileReducer'
import { appointmentPatientReducer } from './reducers/patient/appointmentReducers';
import { appointmentDoctorReducer } from './reducers/doctor/appointmentDoctorReducer';
import { medicationPatientReducer } from './reducers/patient/medicationReducer';
import { vitalsReducers } from './reducers/patient/vitalsReducers';
import doctorReducer from './slices/healthcare/authSlice';
import loaderReducer from './slices/common/loaderSlice';
import docotrAppointmentSlice from './slices/healthcare/appointmentSlice';
import doctorProfileSlice from './slices/healthcare/profileSlice';
import vitalSlice from './slices/patients/vitalSlice';
import { PaymentsReducer } from './reducers/commonReducers';

const store = configureStore({
  reducer: {
    patientAuth: authPatientReducer,
    appointmentData: appointmentPatientReducer,
    doctorAppointmentData: appointmentDoctorReducer,
    medicationData: medicationPatientReducer,
    vitalsData: vitalsReducers,
    doctorAuth: authDoctorReducer,
    commonReducerData: PaymentsReducer,
    profileData: doctorProfileReducer,
    loader: loaderReducer, // Adjusted key to match slice name
    doctorAppointment: docotrAppointmentSlice,
    doctorProfile: doctorProfileSlice,
    vitals: vitalSlice
  },
});

export default store;
