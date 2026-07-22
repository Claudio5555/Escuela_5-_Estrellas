import React, { useState } from 'react';
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
      setExito('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      setFormData({
        nombre_usuario: '',
        correo: '',
        contrasena: '',
        rol: 'Director',
      });
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '40px 36px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '2.2rem', marginBottom: '10px', filter: 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.4))' }}>
          ⭐️⭐️⭐️⭐️⭐️
        </div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
          Crear Cuenta
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '6px' }}>
          Sistema de Gestión Educativa Escuela 5 Estrellas
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {exito && <div className="alert alert-success">✅ {exito}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre Completo</label>
          <input
            type="text"
            name="nombre_usuario"
            className="form-input"
            placeholder="Ej. Prof. Juan Pérez"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Rol en la Escuela</label>
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

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '14px' }}>
          {loading ? 'Registrando...' : 'Registrar Cuenta'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
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
