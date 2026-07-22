import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
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
    <div className="glass-card animate-fade-in" style={{ padding: '32px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={22} className="star-icon" />
          ))}
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Iniciar Sesión
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
          Bienvenido a Escuela 5 Estrellas
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            name="correo"
            className="form-input"
            placeholder="Correo Electrónico"
            value={formData.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            name="contrasena"
            className="form-input"
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        ¿No tienes una cuenta aún?{' '}
        <span
          onClick={onSwitchToRegister}
          style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
        >
          Regístrate aquí
        </span>
      </div>
    </div>
  );
}
