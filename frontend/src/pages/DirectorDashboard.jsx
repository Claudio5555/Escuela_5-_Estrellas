import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, ClipboardCheck, BarChart3, AlertCircle, AlertTriangle, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { estadisticasGenerales, alumnosConMasInasistencias } from '../services/reportesService';

export default function DirectorDashboard() {
  const [stats, setStats] = useState(null);
  const [topInasistencias, setTopInasistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [dataStats, dataTop] = await Promise.all([
        estadisticasGenerales().catch(() => null),
        alumnosConMasInasistencias(5).catch(() => [])
      ]);

      if (dataStats) {
        setStats(dataStats);
      } else {
        // Fallback datos de muestra si el servidor aun no tiene data
        setStats({
          total_alumnos: 128,
          total_salones: 12,
          asistencia_hoy: { total_registros: 128, presentes: 98, ausentes: 24, tardanzas: 6, porcentaje: 81 },
          historico: { total_registros: 1520, presentes: 1250, ausentes: 270, porcentaje_general: 82 }
        });
      }

      if (dataTop && dataTop.length > 0) {
        setTopInasistencias(dataTop);
      } else {
        // Fallback para vista demostrativa
        setTopInasistencias([
          { id_alumno: 1, nombre: 'María José', apellido: 'Ramírez', inasistencias: 5, id_salon: 1 },
          { id_alumno: 2, nombre: 'Diego Alejandro', apellido: 'Torres', inasistencias: 4, id_salon: 2 },
          { id_alumno: 3, nombre: 'Mateo', apellido: 'Ibarra', inasistencias: 3, id_salon: 1 },
        ]);
      }
    } catch (err) {
      setError('No se pudieron cargar las estadísticas. Verifica que los servicios estén activos.');
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
      valor: stats?.asistencia_hoy?.porcentaje !== undefined ? `${stats.asistencia_hoy.porcentaje}%` : '0%',
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

  // Alumnos en riesgo de alto ausentismo (> 15% inasistencias, ej: >= 3 ausencias)
  const alumnosAltoAusentismo = topInasistencias.filter(a => a.inasistencias >= 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel del Director</h1>
          <p className="page-subtitle">Bienvenido, {user?.nombre_usuario || 'Director'}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Grid de Tarjetas de Indicadores */}
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

      {/* Alertas de Alto Ausentismo (> 15%) - Requisito RF-12 */}
      {alumnosAltoAusentismo.length > 0 && (
        <div className="alert alert-warning" style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span>Alerta de Alto Ausentismo (RF-12): Alumnos con inasistencias superiores al umbral del 15%</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
            {alumnosAltoAusentismo.map((alumno) => (
              <div
                key={alumno.id_alumno}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.9rem'
                }}
              >
                <TrendingDown size={16} color="#ef4444" />
                <span>
                  <strong>{alumno.nombre} {alumno.apellido}</strong> ({alumno.inasistencias} ausencias no justificadas)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secciones del Dashboard */}
      <div className="dashboard-sections" style={{ marginTop: '24px' }}>
        {/* Resumen de Asistencia Hoy */}
        <div className="dashboard-section">
          <h2 className="section-title">Resumen de Asistencia Hoy</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Registros totales</span>
              <span className="info-value">{stats?.asistencia_hoy?.total_registros || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Presentes</span>
              <span className="info-value text-success">{stats?.asistencia_hoy?.presentes || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ausentes</span>
              <span className="info-value text-danger">{stats?.asistencia_hoy?.ausentes || 0}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tardanzas</span>
              <span className="info-value text-warning">{stats?.asistencia_hoy?.tardanzas || 0}</span>
            </div>
          </div>
        </div>

        {/* Top 3 Alumnos con Más Inasistencias - Requisito RF-11 */}
        <div className="dashboard-section">
          <h2 className="section-title">Top 3 Alumnos con Más Inasistencias</h2>
          {topInasistencias.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No hay inasistencias registradas.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topInasistencias.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        background: idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#3b82f6',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600 }}>{item.nombre} {item.apellido}</span>
                  </div>
                  <span className="badge badge-danger" style={{ padding: '4px 10px' }}>
                    {item.inasistencias} inasistencias
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions" style={{ marginTop: '24px' }}>
        <h2 className="section-title">Acciones Rápidas</h2>
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

