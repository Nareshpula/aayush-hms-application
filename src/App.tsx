import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import PatientProfile from './pages/PatientProfile';
import Registration from './pages/Registration';
import Doctors from './pages/Doctors';
import Settings from './pages/Settings';
import Injections from './pages/Injections';
import Vaccinations from './pages/Vaccinations';
import NewbornVaccinations from './pages/NewbornVaccinations';
import DermatologyProcedures from './pages/DermatologyProcedures';
import Billing from './pages/Billing';
import CancellationRefunds from './pages/CancellationRefunds';
import DischargeBills from './pages/DischargeBills';
import DischargeBillPreview from './components/DischargeBillPreview';
import DischargePatients from './pages/DischargePatients';
import RegistrationInvoicePreview from './components/RegistrationInvoicePreview';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/patients" element={<PatientList />} />
                    <Route path="/patient/:id" element={<PatientProfile />} />
                    <Route path="/registration" element={<Registration />} />
                    <Route path="/registration-preview" element={<RegistrationInvoicePreview />} />
                    <Route path="/cancellation-refunds" element={<CancellationRefunds />} />
                    <Route path="/injections" element={<Injections />} />
                    <Route path="/vaccinations" element={<Vaccinations />} />
                    <Route path="/newborn-vaccinations" element={<NewbornVaccinations />} />
                    <Route path="/dermatology" element={<DermatologyProcedures />} />
                    <Route path="/billing" element={<Billing />} />
                    <Route path="/discharge-bills" element={<DischargeBills />} />
                    <Route path="/discharge-bill-preview" element={<DischargeBillPreview />} />
                    <Route path="/discharge-patients" element={<DischargePatients />} />
                    <Route path="/doctors" element={<Doctors />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;