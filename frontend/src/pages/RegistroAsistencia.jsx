import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Save, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { obtenerSalones, obtenerAlumnos } from '../services/estudiantesService';
import { registrarAsistencia, obtenerAsistenciaSalon } from '../services/asistenciaService';

export default function RegistroAsistencia() {
  const [salones, setSalones] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [salonSeleccionado, setSalonSeleccionado] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [registros, setRegistros] = useState({});
  const [ultimaFechaRegistro, setUltimaFechaRegistro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    cargarSalones();
  }, []);

  useEffect(() => {
    if (salonSeleccionado) {
      cargarAlumnosYAsistencia();
    }
  }, [salonSeleccionado, fecha]);

  const cargarSalones = async () => {
    try {
      const data = await obtenerSalones();
      setSalones(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const cargarAlumnosYAsistencia = async () => {
    try {
      setLoading(true);
      setError('');
      setUltimaFechaRegistro(null);

      // Cargar alumnos del salón
      const alumnosData = await obtenerAlumnos(salonSeleccionado);
      setAlumnos(alumnosData);

      // Cargar asistencia existente para esa fecha
      try {
        const asistenciaData = await obtenerAsistenciaSalon(salonSeleccionado, fecha);
        const registrosExistentes = {};
        let fechaUltima = null;

        asistenciaData.forEach((a) => {
          registrosExistentes[a.id_alumno] = {
            estado: a.estado,
            observacion: a.observacion || '',
            fecha_registro: a.fecha_registro
          };
          if (a.fecha_registro && (!fechaUltima || new Date(a.fecha_registro) > new Date(fechaUltima))) {
            fechaUltima = a.fecha_registro;
          }
        });

        if (fechaUltima) {
          setUltimaFechaRegistro(fechaUltima);
        }

        // Inicializar registros
        const nuevosRegistros = {};
        alumnosData.forEach((alumno) => {
          if (registrosExistentes[alumno.id_alumno]) {
            nuevosRegistros[alumno.id_alumno] = registrosExistentes[alumno.id_alumno];
          } else {
            nuevosRegistros[alumno.id_alumno] = { estado: 'Presente', observacion: '', fecha_registro: null };
          }
        });
        setRegistros(nuevosRegistros);
      } catch {
        const nuevosRegistros = {};
        alumnosData.forEach((alumno) => {
          nuevosRegistros[alumno.id_alumno] = { estado: 'Presente', observacion: '', fecha_registro: null };
        });
        setRegistros(nuevosRegistros);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = (id_alumno, estado) => {
    setRegistros(prev => ({
      ...prev,
      [id_alumno]: { ...prev[id_alumno], estado }
    }));
  };

  const cambiarObservacion = (id_alumno, observacion) => {
    setRegistros(prev => ({
      ...prev,
      [id_alumno]: { ...prev[id_alumno], observacion }
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setError('');
    setExito('');

    try {
      const registrosArray = Object.entries(registros).map(([id_alumno, data]) => ({
        id_alumno: Number(id_alumno),
        estado: data.estado,
        observacion: data.observacion || null
      }));

      const res = await registrarAsistencia({
        id_salon: Number(salonSeleccionado),
        fecha: fecha,
        registros: registrosArray
      });

      const ahora = new Date().toISOString();
      setUltimaFechaRegistro(ahora);

      setExito(`Asistencia guardada para ${registrosArray.length} alumnos.`);
      cargarAlumnosYAsistencia();
      setTimeout(() => setExito(''), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const estados = ['Presente', 'Ausente', 'Tardanza', 'Justificado'];

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Presente': return 'estado-btn estado-presente';
      case 'Ausente': return 'estado-btn estado-ausente';
      case 'Tardanza': return 'estado-btn estado-tardanza';
      case 'Justificado': return 'estado-btn estado-justificado';
      default: return 'estado-btn';
    }
  };

  const formatearFechaHora = (isoStr) => {
    if (!isoStr) return 'No registrado aún';
    return new Date(isoStr).toLocaleString('es-HN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Registro de Asistencia</h1>
          <p className="page-subtitle">Registrar y consultar asistencia diaria por salón</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}
      {exito && <div className="alert alert-success"><CheckCircle size={18} /> <span>{exito}</span></div>}

      <div className="filter-bar">
        <div className="form-group">
          <label className="form-label">Salón</label>
          <select
            className="form-select filter-select"
            value={salonSeleccionado}
            onChange={(e) => setSalonSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar salón</option>
            {salones.map((s) => (
              <option key={s.id_salon} value={s.id_salon}>{s.grado} - Sección {s.seccion}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Asistencia</label>
          <input
            type="date"
            className="form-input filter-select"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      </div>

      {salonSeleccionado && !loading && alumnos.length > 0 && (
        <>
          <div className="asistencia-header-info" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div className="asistencia-resumen" style={{ margin: 0 }}>
              <span className="resumen-item text-success">Presentes: {Object.values(registros).filter(r => r.estado === 'Presente').length}</span>
              <span className="resumen-item text-danger">Ausentes: {Object.values(registros).filter(r => r.estado === 'Ausente').length}</span>
              <span className="resumen-item text-warning">Tardanzas: {Object.values(registros).filter(r => r.estado === 'Tardanza').length}</span>
              <span className="resumen-item text-info">Justificados: {Object.values(registros).filter(r => r.estado === 'Justificado').length}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              <Clock size={16} color="var(--accent-gold)" />
              <span>Último guardado: <strong style={{ color: '#ffffff' }}>{formatearFechaHora(ultimaFechaRegistro)}</strong></span>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Estado</th>
                  <th>Observación</th>
                  <th>Hora de Registro</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno, idx) => (
                  <tr key={alumno.id_alumno}>
                    <td>{idx + 1}</td>
                    <td className="td-bold">{alumno.nombre}</td>
                    <td>{alumno.apellido}</td>
                    <td>
                      <div className="estado-group">
                        {estados.map((estado) => (
                          <button
                            key={estado}
                            className={`${getEstadoClass(estado)} ${registros[alumno.id_alumno]?.estado === estado ? 'estado-activo' : ''}`}
                            onClick={() => cambiarEstado(alumno.id_alumno, estado)}
                            type="button"
                          >
                            {estado.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input form-input-sm"
                        placeholder="Observación (opcional)"
                        value={registros[alumno.id_alumno]?.observacion || ''}
                        onChange={(e) => cambiarObservacion(alumno.id_alumno, e.target.value)}
                      />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {registros[alumno.id_alumno]?.fecha_registro ? formatearFechaHora(registros[alumno.id_alumno].fecha_registro) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="save-bar">
            <button
              className="btn-primary btn-lg"
              onClick={handleGuardar}
              disabled={guardando}
            >
              <Save size={20} />
              {guardando ? 'Guardando...' : 'Guardar Asistencia'}
            </button>
          </div>
        </>
      )}

      {salonSeleccionado && !loading && alumnos.length === 0 && (
        <div className="empty-state">
          <ClipboardCheck size={48} />
          <p>No hay alumnos registrados en este salón</p>
        </div>
      )}

      {loading && (
        <div className="empty-state">
          <p>Cargando alumnos...</p>
        </div>
      )}
    </div>
  );
}
