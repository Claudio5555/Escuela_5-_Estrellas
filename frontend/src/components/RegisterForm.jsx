import React, { useState } from 'react';
import { Star, CheckCircle, AlertCircle } from 'lucide-react';
import { registrarUsuario } from '../services/authService';

export default function RegisterForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    contrasena: '',
    rol: 'Director',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setExito('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setExito('');

    try {
      await registrarUsuario(formData);
      setExito('¡Cuenta creada con éxito!');
      setFormData({
        nombre_usuario: '',
        correo: '',
        contrasena: '',
        rol: 'Director',
      });
      setTimeout(() => {
        onSwitchToLogin();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario');
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
          Crear Cuenta
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
          Sistema de Gestión Educativa Escuela 5 Estrellas
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}
      {exito && (
        <div className="alert alert-success">
          <CheckCircle size={18} /> <span>{exito}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="nombre_usuario"
            className="form-input"
            placeholder="Nombre Completo"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div className="form-group">
          <select
            name="rol"
            className="form-select"
            value={formData.rol}
            onChange={handleChange}
          >
            <option value="Director">Director / Administrador</option>
            <option value="Maestro">Maestro / Docente</option>
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Registrando...' : 'Registrar Cuenta'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
        ¿Ya tienes cuenta?{' '}
        <span
          onClick={onSwitchToLogin}
          style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}
        >
          Inicia Sesión
        </span>
      </div>
    </div>
  );
}
