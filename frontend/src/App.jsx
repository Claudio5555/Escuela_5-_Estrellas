import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import DirectorDashboard from './pages/DirectorDashboard';
import DirectorUsuarios from './pages/DirectorUsuarios';
import DirectorSalones from './pages/DirectorSalones';
import DirectorAlumnos from './pages/DirectorAlumnos';
import RegistroAsistencia from './pages/RegistroAsistencia';
import MaestroDashboard from './pages/MaestroDashboard';
import AlumnoDashboard from './pages/AlumnoDashboard';
import Reportes from './pages/Reportes';

function DashboardRedirect() {
  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  if (!user) return <Navigate to="/" replace />;

  switch (user.rol) {
    case 'Director':
      return <DashboardLayout><DirectorDashboard /></DashboardLayout>;
    case 'Maestro':
      return <DashboardLayout><MaestroDashboard /></DashboardLayout>;
    case 'Alumno':
      return <DashboardLayout><AlumnoDashboard /></DashboardLayout>;
    default:
      return <Navigate to="/" replace />;
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login - unica pagina publica */}
        <Route path="/" element={<LoginForm />} />

        {/* Dashboard - redirige segun rol */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        } />

        {/* Rutas del Director */}
        <Route path="/usuarios" element={
          <ProtectedRoute allowedRoles={['Director']}>
            <DashboardLayout><DirectorUsuarios /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/salones" element={
          <ProtectedRoute allowedRoles={['Director']}>
            <DashboardLayout><DirectorSalones /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/alumnos" element={
          <ProtectedRoute allowedRoles={['Director']}>
            <DashboardLayout><DirectorAlumnos /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Asistencia - Maestro y Director */}
        <Route path="/asistencia" element={
          <ProtectedRoute allowedRoles={['Director', 'Maestro']}>
            <DashboardLayout><RegistroAsistencia /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Reportes - Maestro y Director */}
        <Route path="/reportes" element={
          <ProtectedRoute allowedRoles={['Director', 'Maestro']}>
            <DashboardLayout><Reportes /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Ruta catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
