import React, { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, Search } from 'lucide-react';
import { obtenerSalones, obtenerAlumnos } from '../services/estudiantesService';
import { reporteAsistenciaDiaria, reporteAsistenciaSalon, reporteAlumno, alumnosConMasInasistencias } from '../services/reportesService';

export default function Reportes() {
  const [tipoReporte, setTipoReporte] = useState('diario');
  const [salones, setSalones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [reporte, setReporte] = useState(null);
  const [inasistencias, setInasistencias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  useEffect(() => {
    cargarDatosBase();
  }, []);

  const cargarDatosBase = async () => {
    try {
      const salonesData = await obtenerSalones();
      setSalones(salonesData);
      const alumnosData = await obtenerAlumnos();
      setAlumnos(alumnosData);
    } catch (err) {
      setError(err.message);
    }
  };

  const generarReporte = async () => {
    setLoading(true);
    setError('');
    setReporte(null);
    setInasistencias([]);

    try {
      switch (tipoReporte) {
        case 'diario': {
          const data = await reporteAsistenciaDiaria(fecha);
          setReporte(data);
          break;
        }
        case 'salon': {
          if (!salonSeleccionado) { setError('Selecciona un salon'); setLoading(false); return; }
          const data = await reporteAsistenciaSalon(salonSeleccionado, fechaDesde, fechaHasta);
          setReporte(data);
          break;
        }
        case 'alumno': {
          if (!alumnoSeleccionado) { setError('Selecciona un alumno'); setLoading(false); return; }
          const data = await reporteAlumno(alumnoSeleccionado, fechaDesde, fechaHasta);
          setReporte(data);
          break;
        }
        case 'inasistencias': {
          const data = await alumnosConMasInasistencias(20);
          setInasistencias(data);
          break;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="page-title">Reportes</h1>
          <p className="page-subtitle">Consultar reportes de asistencia</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}

      <div className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Tipo de Reporte</label>
            <select className="form-select" value={tipoReporte} onChange={(e) => { setTipoReporte(e.target.value); setReporte(null); setInasistencias([]); }}>
              {user?.rol === 'Director' && <option value="diario">Asistencia Diaria (General)</option>}
              <option value="salon">Asistencia por Salon</option>
              <option value="alumno">Reporte Individual de Alumno</option>
              {user?.rol === 'Director' && <option value="inasistencias">Alumnos con mas Inasistencias</option>}
            </select>
          </div>

          {tipoReporte === 'diario' && (
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-input" value={fecha} onChange={(e) => setFecha(e.target.value)} />
            </div>
          )}

          {tipoReporte === 'salon' && (
            <div className="form-group">
              <label className="form-label">Salon</label>
              <select className="form-select" value={salonSeleccionado} onChange={(e) => setSalonSeleccionado(e.target.value)}>
                <option value="">Seleccionar salon</option>
                {salones.map((s) => <option key={s.id_salon} value={s.id_salon}>{s.grado} - Seccion {s.seccion}</option>)}
              </select>
            </div>
          )}

          {tipoReporte === 'alumno' && (
            <div className="form-group">
              <label className="form-label">Alumno</label>
              <select className="form-select" value={alumnoSeleccionado} onChange={(e) => setAlumnoSeleccionado(e.target.value)}>
                <option value="">Seleccionar alumno</option>
                {alumnos.map((a) => <option key={a.id_alumno} value={a.id_alumno}>{a.nombre} {a.apellido}</option>)}
              </select>
            </div>
          )}

          {(tipoReporte === 'salon' || tipoReporte === 'alumno') && (
            <>
              <div className="form-group">
                <label className="form-label">Desde</label>
                <input type="date" className="form-input" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Hasta</label>
                <input type="date" className="form-input" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <button className="btn-primary btn-sm" onClick={generarReporte} disabled={loading}>
          <Search size={18} /> {loading ? 'Generando...' : 'Generar Reporte'}
        </button>
      </div>

      {/* Reporte Diario */}
      {tipoReporte === 'diario' && reporte && (
        <div className="reporte-resultado animate-fade-in">
          <h2 className="section-title">Reporte del {reporte.fecha}</h2>
          <div className="stats-grid stats-grid-sm">
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.resumen_general?.total_registros || 0}</span><span className="stat-mini-label">Total</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-success">{reporte.resumen_general?.presentes || 0}</span><span className="stat-mini-label">Presentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-danger">{reporte.resumen_general?.ausentes || 0}</span><span className="stat-mini-label">Ausentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-warning">{reporte.resumen_general?.tardanzas || 0}</span><span className="stat-mini-label">Tardanzas</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.resumen_general?.porcentaje_asistencia || 0}%</span><span className="stat-mini-label">Asistencia</span></div>
          </div>

          {reporte.por_salon && reporte.por_salon.length > 0 && (
            <div className="table-container">
              <h3 className="subsection-title">Desglose por Salon</h3>
              <table className="data-table">
                <thead><tr><th>ID Salon</th><th>Total</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th></tr></thead>
                <tbody>
                  {reporte.por_salon.map((s, i) => (
                    <tr key={i}><td>{s.id_salon}</td><td>{s.total}</td><td className="text-success">{s.presentes}</td><td className="text-danger">{s.ausentes}</td><td className="text-warning">{s.tardanzas}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reporte por Salon */}
      {tipoReporte === 'salon' && reporte && (
        <div className="reporte-resultado animate-fade-in">
          <h2 className="section-title">
            Reporte de {reporte.salon ? `${reporte.salon.grado} - Seccion ${reporte.salon.seccion}` : 'Salon'}
          </h2>
          <div className="stats-grid stats-grid-sm">
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.resumen?.total_registros || 0}</span><span className="stat-mini-label">Total Registros</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-success">{reporte.resumen?.presentes || 0}</span><span className="stat-mini-label">Presentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-danger">{reporte.resumen?.ausentes || 0}</span><span className="stat-mini-label">Ausentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.resumen?.porcentaje_asistencia || 0}%</span><span className="stat-mini-label">Asistencia</span></div>
          </div>

          {reporte.alumnos && reporte.alumnos.length > 0 && (
            <div className="table-container">
              <h3 className="subsection-title">Detalle por Alumno</h3>
              <table className="data-table">
                <thead><tr><th>Alumno</th><th>Dias</th><th>Presentes</th><th>Ausentes</th><th>Tardanzas</th><th>Asistencia</th></tr></thead>
                <tbody>
                  {reporte.alumnos.map((a, i) => (
                    <tr key={i}>
                      <td className="td-bold">{a.nombre} {a.apellido}</td>
                      <td>{a.total_dias}</td>
                      <td className="text-success">{a.presentes}</td>
                      <td className="text-danger">{a.ausentes}</td>
                      <td className="text-warning">{a.tardanzas}</td>
                      <td>{a.porcentaje_asistencia}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reporte Individual de Alumno */}
      {tipoReporte === 'alumno' && reporte && (
        <div className="reporte-resultado animate-fade-in">
          <h2 className="section-title">
            Reporte de {reporte.alumno ? `${reporte.alumno.nombre} ${reporte.alumno.apellido}` : 'Alumno'}
          </h2>
          <div className="stats-grid stats-grid-sm">
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.estadisticas?.total_dias || 0}</span><span className="stat-mini-label">Total Dias</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-success">{reporte.estadisticas?.presentes || 0}</span><span className="stat-mini-label">Presentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value text-danger">{reporte.estadisticas?.ausentes || 0}</span><span className="stat-mini-label">Ausentes</span></div>
            <div className="stat-card-mini"><span className="stat-mini-value">{reporte.estadisticas?.porcentaje_asistencia || 0}%</span><span className="stat-mini-label">Asistencia</span></div>
          </div>

          {reporte.historial && reporte.historial.length > 0 && (
            <div className="table-container">
              <h3 className="subsection-title">Historial</h3>
              <table className="data-table">
                <thead><tr><th>Fecha Escolar</th><th>Estado</th><th>Observación</th><th>Fecha y Hora de Registro</th></tr></thead>
                <tbody>
                  {reporte.historial.map((h, i) => (
                    <tr key={i}>
                      <td>{new Date(h.fecha).toLocaleDateString('es-HN')}</td>
                      <td><span className={getEstadoBadge(h.estado)}>{h.estado}</span></td>
                      <td>{h.observacion || '-'}</td>
                      <td>
                        {h.fecha_registro
                          ? new Date(h.fecha_registro).toLocaleString('es-HN', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit', second: '2-digit'
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inasistencias */}
      {tipoReporte === 'inasistencias' && inasistencias.length > 0 && (
        <div className="reporte-resultado animate-fade-in">
          <h2 className="section-title">Alumnos con Mayor Inasistencia</h2>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Posicion</th><th>Alumno</th><th>Salon</th><th>Inasistencias</th></tr></thead>
              <tbody>
                {inasistencias.map((a, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="td-bold">{a.nombre} {a.apellido}</td>
                    <td>{a.id_salon || '-'}</td>
                    <td className="text-danger td-bold">{a.inasistencias}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
