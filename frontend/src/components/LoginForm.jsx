import React, { useState } from 'react';
import { loginUsuario } from '../services/authService';

export default function LoginForm({ onSwitchToRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUsuario(formData);
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        if (onLoginSuccess) onLoginSuccess(data);
      }
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '36px', maxWidth: '440px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐️⭐️⭐️⭐️⭐️</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Iniciar Sesión</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Bienvenido a Escuela 5 Estrellas
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Correo Electrónico</label>
          <input
            type="email"
            name="correo"
            className="form-input"
            placeholder="correo@escuela.com"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            className="form-input"
            placeholder="••••••••"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        ¿No tienes una cuenta aún?{' '}
        <span
          onClick={onSwitchToRegister}
          style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
        >
          Regístrate aquí
        </span>
      </div>
    </div>
  );
}
