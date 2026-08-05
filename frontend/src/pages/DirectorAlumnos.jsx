import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import { obtenerAlumnos, crearAlumno, actualizarAlumno, eliminarAlumno } from '../services/estudiantesService';
import { obtenerSalones } from '../services/estudiantesService';

export default function DirectorAlumnos() {
  const [alumnos, setAlumnos] = useState([]);
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [filtroSalon, setFiltroSalon] = useState('');
  const [formData, setFormData] = useState({ nombre: '', apellido: '', id_salon: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    cargarAlumnos();
  }, [filtroSalon]);

  const cargarDatos = async () => {
    try {
      const salonesData = await obtenerSalones();
      setSalones(salonesData);
    } catch (err) {
      setError(err.message);
    }
    cargarAlumnos();
  };

  const cargarAlumnos = async () => {
    try {
      setLoading(true);
      const data = await obtenerAlumnos(filtroSalon || undefined);
      setAlumnos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    try {
      const datos = { ...formData, id_salon: Number(formData.id_salon) };
      if (editando) {
        await actualizarAlumno(editando, datos);
        setExito('Alumno actualizado exitosamente');
      } else {
        await crearAlumno(datos);
        setExito('Alumno creado exitosamente');
      }
      setFormData({ nombre: '', apellido: '', id_salon: '' });
      setMostrarForm(false);
      setEditando(null);
      cargarAlumnos();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (alumno) => {
    setFormData({ nombre: alumno.nombre, apellido: alumno.apellido, id_salon: alumno.id_salon.toString() });
    setEditando(alumno.id_alumno);
    setMostrarForm(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`Estas seguro de eliminar al alumno "${nombre}"?`)) return;
    try {
      await eliminarAlumno(id);
      setExito('Alumno eliminado correctamente');
      cargarAlumnos();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion de Alumnos</h1>
          <p className="page-subtitle">Administrar registro de alumnos</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setFormData({ nombre: '', apellido: '', id_salon: '' }); }}>
          <Plus size={18} /> Nuevo Alumno
        </button>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}
      {exito && <div className="alert alert-success"><CheckCircle size={18} /> <span>{exito}</span></div>}

      {mostrarForm && (
        <div className="form-card animate-fade-in">
          <h3 className="form-card-title">{editando ? 'Editar Alumno' : 'Registrar Nuevo Alumno'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-input" placeholder="Nombre del alumno" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Apellido</label>
                <input type="text" className="form-input" placeholder="Apellido del alumno" value={formData.apellido} onChange={(e) => setFormData({ ...formData, apellido: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Salon</label>
                <select className="form-select" value={formData.id_salon} onChange={(e) => setFormData({ ...formData, id_salon: e.target.value })} required>
                  <option value="">Seleccionar salon</option>
                  {salones.map((s) => (
                    <option key={s.id_salon} value={s.id_salon}>{s.grado} - Seccion {s.seccion}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">{editando ? 'Actualizar' : 'Registrar Alumno'}</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => { setMostrarForm(false); setEditando(null); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <label className="form-label">Filtrar por salon:</label>
        <select className="form-select filter-select" value={filtroSalon} onChange={(e) => setFiltroSalon(e.target.value)}>
          <option value="">Todos los salones</option>
          {salones.map((s) => (
            <option key={s.id_salon} value={s.id_salon}>{s.grado} - Seccion {s.seccion}</option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Salon</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Cargando alumnos...</td></tr>
            ) : alumnos.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No hay alumnos registrados</td></tr>
            ) : (
              alumnos.map((a) => (
                <tr key={a.id_alumno}>
                  <td>{a.id_alumno}</td>
                  <td className="td-bold">{a.nombre}</td>
                  <td>{a.apellido}</td>
                  <td>{a.salon ? `${a.salon.grado} - ${a.salon.seccion}` : a.id_salon}</td>
                  <td>{new Date(a.fecha_creacion).toLocaleDateString('es-HN')}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(a)} title="Editar"><Edit2 size={16} /></button>
                      <button className="btn-icon btn-danger" onClick={() => handleEliminar(a.id_alumno, a.nombre)} title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
