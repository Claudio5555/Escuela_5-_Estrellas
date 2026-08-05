import React, { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../services/authService';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    correo: '',
    contrasena: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        localStorage.setItem('auth_user', JSON.stringify(data.usuario));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Credenciales invalidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="glass-card animate-fade-in" style={{ padding: '32px 36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={22} className="star-icon" />
            ))}
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
            Iniciar Sesion
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
            Sistema de Control de Asistencia Escolar
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
              id="login-correo"
              type="email"
              name="correo"
              className="form-input"
              placeholder="Correo Electronico"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              id="login-contrasena"
              type="password"
              name="contraseña"
              className="form-input"
              placeholder="Contraseña"
              value={formData.contraseña || formData.contrasena || ''}
              onChange={(e) => setFormData({ ...formData, contraseña: e.target.value, contrasena: e.target.value })}
              required
            />
          </div>

          <button id="login-submit" type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Escuela 5 Estrellas - Sistema de Gestion
        </div>
      </div>
    </div>
  );
}
