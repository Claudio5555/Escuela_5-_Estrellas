import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, ClipboardCheck, BarChart3, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { estadisticasGenerales } from '../services/reportesService';

export default function DirectorDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const data = await estadisticasGenerales();
      setStats(data);
    } catch (err) {
      setError('No se pudieron cargar las estadisticas. Verifica que los servicios esten activos.');
    } finally {
      setLoading(false);
    }
  };

  const tarjetas = [
    {
      titulo: 'Total Alumnos',
      valor: stats?.total_alumnos || 0,
      icono: GraduationCap,
      color: '#3b82f6',
      ruta: '/alumnos'
    },
    {
      titulo: 'Total Salones',
      valor: stats?.total_salones || 0,
      icono: School,
      color: '#8b5cf6',
      ruta: '/salones'
    },
    {
      titulo: 'Asistencia Hoy',
      valor: stats?.asistencia_hoy?.porcentaje ? `${stats.asistencia_hoy.porcentaje}%` : '0%',
      icono: ClipboardCheck,
      color: '#10b981',
      ruta: '/asistencia'
    },
    {
      titulo: 'Presentes Hoy',
      valor: stats?.asistencia_hoy?.presentes || 0,
      icono: Users,
      color: '#f59e0b',
      ruta: '/reportes'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Panel del Director</h1>
        <p className="page-subtitle">Bienvenido, {user?.nombre_usuario || 'Director'}</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        {tarjetas.map((t, i) => (
          <div
            key={i}
            className="stat-card"
            onClick={() => navigate(t.ruta)}
            style={{ cursor: 'pointer' }}
          >
            <div className="stat-card-icon" style={{ background: `${t.color}20`, color: t.color }}>
              <t.icono size={28} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{loading ? '...' : t.valor}</span>
              <span className="stat-card-label">{t.titulo}</span>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2 className="section-title">Resumen de Asistencia Hoy</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Registros totales</span>
                <span className="info-value">{stats.asistencia_hoy?.total_registros || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Presentes</span>
                <span className="info-value text-success">{stats.asistencia_hoy?.presentes || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Ausentes</span>
                <span className="info-value text-danger">{stats.asistencia_hoy?.ausentes || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tardanzas</span>
                <span className="info-value text-warning">{stats.asistencia_hoy?.tardanzas || 0}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Historico General</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Total registros historicos</span>
                <span className="info-value">{stats.historico?.total_registros || 0}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Asistencia general</span>
                <span className="info-value">{stats.historico?.porcentaje_general || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="quick-actions">
        <h2 className="section-title">Acciones Rapidas</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/usuarios')}>
            <Users size={20} /> Gestionar Usuarios
          </button>
          <button className="action-btn" onClick={() => navigate('/salones')}>
            <School size={20} /> Gestionar Salones
          </button>
          <button className="action-btn" onClick={() => navigate('/asistencia')}>
            <ClipboardCheck size={20} /> Registrar Asistencia
          </button>
          <button className="action-btn" onClick={() => navigate('/reportes')}>
            <BarChart3 size={20} /> Ver Reportes
          </button>
        </div>
      </div>
    </div>
  );
}
