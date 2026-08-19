import React, { useState, useEffect } from 'react';
import { Users, School, GraduationCap, ClipboardCheck, BarChart3, AlertCircle, AlertTriangle, TrendingDown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obtenerAlumnos, obtenerSalones } from '../services/estudiantesService';
import { obtenerAsistenciaSalon, obtenerAsistenciaAlumno } from '../services/asistenciaService';

export default function DirectorDashboard() {
  const [totalAlumnos, setTotalAlumnos] = useState(0);
  const [totalSalones, setTotalSalones] = useState(0);
  const [asistenciaHoy, setAsistenciaHoy] = useState({ total_registros: 0, presentes: 0, ausentes: 0, tardanzas: 0, porcentaje: 0 });
  const [historicoAsistencia, setHistoricoAsistencia] = useState({ total_registros: 0, presentes: 0, ausentes: 0, porcentaje_general: 0 });
  const [topInasistencias, setTopInasistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  // Obtener fecha de hoy en formato YYYY-MM-DD en zona local
  const getFechaHoy = () => {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Cargar alumnos y salones directamente del servicio-estudiantes
      const [alumnos, salones] = await Promise.all([
        obtenerAlumnos().catch(() => []),
        obtenerSalones().catch(() => [])
      ]);

      const numAlumnos = Array.isArray(alumnos) ? alumnos.length : 0;
      const numSalones = Array.isArray(salones) ? salones.length : 0;

      setTotalAlumnos(numAlumnos);
      setTotalSalones(numSalones);

      // 2. Calcular asistencia de hoy para todos los salones disponibles
      if (numSalones > 0) {
        const fechaHoy = getFechaHoy();

        // Obtener asistencia de todos los salones en paralelo
        const asistenciasPorSalon = await Promise.all(
          salones.map(salon =>
            obtenerAsistenciaSalon(salon.id_salon, fechaHoy).catch(() => [])
          )
        );

        // Aplanar todos los registros de asistencia del día
        const todosLosRegistrosHoy = asistenciasPorSalon.flat();

        const presentesHoy = todosLosRegistrosHoy.filter(r => r.estado === 'Presente').length;
        const ausentesHoy = todosLosRegistrosHoy.filter(r => r.estado === 'Ausente').length;
        const tardanzasHoy = todosLosRegistrosHoy.filter(r => r.estado === 'Tardanza').length;
        const totalHoy = todosLosRegistrosHoy.length;
        const porcentajeHoy = totalHoy > 0 ? Math.round(((presentesHoy + tardanzasHoy) / totalHoy) * 100) : 0;

        setAsistenciaHoy({
          total_registros: totalHoy,
          presentes: presentesHoy,
          ausentes: ausentesHoy,
          tardanzas: tardanzasHoy,
          porcentaje: porcentajeHoy
        });

        // 3. Calcular top de inasistencias por alumno (historial completo)
        if (numAlumnos > 0) {
          // Obtener historial de cada alumno en paralelo (con límite para no sobrecargar)
          const alumnosAConsultar = alumnos.slice(0, 50); // límite de seguridad
          const historialPorAlumno = await Promise.all(
            alumnosAConsultar.map(alumno =>
              obtenerAsistenciaAlumno(alumno.id_alumno).catch(() => [])
            )
          );

          // Calcular total histórico
          const todosLosRegistros = historialPorAlumno.flat();
          const totalHistorico = todosLosRegistros.length;
          const presentesHistorico = todosLosRegistros.filter(r => r.estado === 'Presente').length;
          const ausentesHistorico = todosLosRegistros.filter(r => r.estado === 'Ausente').length;
          const porcentajeHistorico = totalHistorico > 0 ? Math.round((presentesHistorico / totalHistorico) * 100) : 0;

          setHistoricoAsistencia({
            total_registros: totalHistorico,
            presentes: presentesHistorico,
            ausentes: ausentesHistorico,
            porcentaje_general: porcentajeHistorico
          });

          // Calcular inasistencias (ausencias no justificadas) por alumno
          const rankingInasistencias = alumnosAConsultar.map((alumno, idx) => {
            const historial = historialPorAlumno[idx] || [];
            const inasistencias = historial.filter(r => r.estado === 'Ausente').length;
            return {
              id_alumno: alumno.id_alumno,
              nombre: alumno.nombre,
              apellido: alumno.apellido,
              id_salon: alumno.id_salon,
              inasistencias
            };
          })
            .filter(a => a.inasistencias > 0)
            .sort((a, b) => b.inasistencias - a.inasistencias)
            .slice(0, 5);

          setTopInasistencias(rankingInasistencias);
        }
      }

    } catch (err) {
      console.error('Error cargando datos del dashboard:', err);
      setError('No se pudieron cargar las estadísticas. Verifica que los servicios estén activos.');
    } finally {
      setLoading(false);
    }
  };

  const tarjetas = [
    {
      titulo: 'Total Alumnos',
      valor: totalAlumnos,
      icono: GraduationCap,
      color: '#3b82f6',
      ruta: '/alumnos'
    },
    {
      titulo: 'Total Salones',
      valor: totalSalones,
      icono: School,
      color: '#8b5cf6',
      ruta: '/salones'
    },
    {
      titulo: 'Asistencia Hoy',
      valor: `${asistenciaHoy.porcentaje}%`,
      icono: ClipboardCheck,
      color: '#10b981',
      ruta: '/asistencia'
    },
    {
      titulo: 'Presentes Hoy',
      valor: asistenciaHoy.presentes,
      icono: Users,
      color: '#f59e0b',
      ruta: '/reportes'
    }
  ];

  // Alumnos en riesgo de alto ausentismo (>= 3 ausencias)
  const alumnosAltoAusentismo = topInasistencias.filter(a => a.inasistencias >= 3);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel del Director</h1>
          <p className="page-subtitle">Bienvenido, {user?.nombre_usuario || 'Director Principal'}</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={cargarDatos}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
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

      {/* Alertas de Alto Ausentismo (>= 3 ausencias) - Requisito RF-12 */}
      {!loading && alumnosAltoAusentismo.length > 0 && (
        <div className="alert alert-warning" style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            <AlertTriangle size={20} color="#f59e0b" />
            <span>Alerta de Alto Ausentismo (RF-12): Alumnos con inasistencias superiores al umbral</span>
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
                  <strong>{alumno.nombre} {alumno.apellido}</strong> ({alumno.inasistencias} ausencias)
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
              <span className="info-value">{loading ? '...' : asistenciaHoy.total_registros}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Presentes</span>
              <span className="info-value text-success">{loading ? '...' : asistenciaHoy.presentes}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ausentes</span>
              <span className="info-value text-danger">{loading ? '...' : asistenciaHoy.ausentes}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tardanzas</span>
              <span className="info-value text-warning">{loading ? '...' : asistenciaHoy.tardanzas}</span>
            </div>
          </div>
        </div>

        {/* Histórico General */}
        <div className="dashboard-section">
          <h2 className="section-title">Histórico General</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Total registros históricos</span>
              <span className="info-value">{loading ? '...' : historicoAsistencia.total_registros}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Asistencia general</span>
              <span className="info-value text-success">{loading ? '...' : `${historicoAsistencia.porcentaje_general}%`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Alumnos con Más Inasistencias - Requisito RF-11 */}
      {!loading && topInasistencias.length > 0 && (
        <div className="dashboard-section" style={{ marginTop: '24px' }}>
          <h2 className="section-title">Top Alumnos con Más Inasistencias</h2>
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
        </div>
      )}

      {/* Mensaje cuando no hay asistencia registrada hoy */}
      {!loading && asistenciaHoy.total_registros === 0 && totalSalones > 0 && (
        <div className="alert alert-warning" style={{ marginTop: '16px' }}>
          <AlertTriangle size={18} />
          <span>No se ha registrado asistencia hoy ({getFechaHoy()}). Usa "Registrar Asistencia" para comenzar.</span>
        </div>
      )}

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
