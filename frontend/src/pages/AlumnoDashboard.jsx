import React, { useState, useEffect } from 'react';
import { ClipboardCheck, AlertCircle } from 'lucide-react';
import { obtenerAsistenciaAlumno } from '../services/asistenciaService';

export default function AlumnoDashboard() {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  useEffect(() => {
    if (user?.id_alumno) {
      cargarAsistencia();
    } else {
      setLoading(false);
    }
  }, []);

  const cargarAsistencia = async () => {
    try {
      setLoading(true);
      const data = await obtenerAsistenciaAlumno(user.id_alumno);
      setAsistencias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalDias = asistencias.length;
  const presentes = asistencias.filter(a => a.estado === 'Presente').length;
  const ausentes = asistencias.filter(a => a.estado === 'Ausente').length;
  const tardanzas = asistencias.filter(a => a.estado === 'Tardanza').length;
  const justificados = asistencias.filter(a => a.estado === 'Justificado').length;
  const porcentaje = totalDias > 0 ? Math.round(((presentes + tardanzas) / totalDias) * 100) : 0;

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'Presente': return 'badge badge-success';
      case 'Ausente': return 'badge badge-danger';
      case 'Tardanza': return 'badge badge-warning';
      case 'Justificado': return 'badge badge-info';
      default: return 'badge';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Asistencia</h1>
          <p className="page-subtitle">Bienvenido, {user?.nombre_usuario || 'Alumno'}</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}

      {!user?.id_alumno ? (
        <div className="empty-state">
          <ClipboardCheck size={48} />
          <p>Tu cuenta no tiene un registro de alumno vinculado. Contacta al Director.</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                <ClipboardCheck size={28} />
              </div>
              <div className="stat-card-info">
                <span className="stat-card-value">{porcentaje}%</span>
                <span className="stat-card-label">Asistencia General</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value text-success">{presentes}</span>
                <span className="stat-card-label">Dias Presente</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value text-danger">{ausentes}</span>
                <span className="stat-card-label">Dias Ausente</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-info">
                <span className="stat-card-value text-warning">{tardanzas}</span>
                <span className="stat-card-label">Tardanzas</span>
              </div>
            </div>
          </div>

          <h2 className="section-title">Historial de Asistencia</h2>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha Escolar</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Fecha y Hora de Registro</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="table-loading">Cargando historial...</td></tr>
                ) : asistencias.length === 0 ? (
                  <tr><td colSpan="4" className="table-empty">No hay registros de asistencia</td></tr>
                ) : (
                  asistencias.map((a) => (
                    <tr key={a.id_asistencia}>
                      <td>{new Date(a.fecha).toLocaleDateString('es-HN')}</td>
                      <td><span className={getEstadoBadge(a.estado)}>{a.estado}</span></td>
                      <td>{a.observacion || '-'}</td>
                      <td>
                        {a.fecha_registro
                          ? new Date(a.fecha_registro).toLocaleString('es-HN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
