import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (!token || !userStr) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(userStr);
      if (!allowedRoles.includes(user.rol)) {
        return <Navigate to="/dashboard" replace />;
      }
    } catch {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
