import React, { useState, useEffect } from 'react';
import { School, Plus, Trash2, Edit2, AlertCircle, CheckCircle } from 'lucide-react';
import { obtenerSalones, crearSalon, actualizarSalon, eliminarSalon } from '../services/estudiantesService';

export default function DirectorSalones() {
  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ grado: '', seccion: '', id_maestro: '' });

  useEffect(() => {
    cargarSalones();
  }, []);

  const cargarSalones = async () => {
    try {
      setLoading(true);
      const data = await obtenerSalones();
      setSalones(data);
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
      const datos = { ...formData, id_maestro: Number(formData.id_maestro) };
      if (editando) {
        await actualizarSalon(editando, datos);
        setExito('Salon actualizado exitosamente');
      } else {
        await crearSalon(datos);
        setExito('Salon creado exitosamente');
      }
      setFormData({ grado: '', seccion: '', id_maestro: '' });
      setMostrarForm(false);
      setEditando(null);
      cargarSalones();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditar = (salon) => {
    setFormData({ grado: salon.grado, seccion: salon.seccion, id_maestro: salon.id_maestro.toString() });
    setEditando(salon.id_salon);
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!confirm('Estas seguro de eliminar este salon?')) return;
    try {
      await eliminarSalon(id);
      setExito('Salon eliminado correctamente');
      cargarSalones();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion de Salones</h1>
          <p className="page-subtitle">Administrar salones de clases y asignaciones</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setFormData({ grado: '', seccion: '', id_maestro: '' }); }}>
          <Plus size={18} /> Nuevo Salon
        </button>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}
      {exito && <div className="alert alert-success"><CheckCircle size={18} /> <span>{exito}</span></div>}

      {mostrarForm && (
        <div className="form-card animate-fade-in">
          <h3 className="form-card-title">{editando ? 'Editar Salon' : 'Crear Nuevo Salon'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Grado</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 1ro, 2do, 3ro"
                  value={formData.grado}
                  onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Seccion</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: A, B, C"
                  value={formData.seccion}
                  onChange={(e) => setFormData({ ...formData, seccion: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">ID Maestro</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="ID del maestro asignado"
                  value={formData.id_maestro}
                  onChange={(e) => setFormData({ ...formData, id_maestro: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">{editando ? 'Actualizar' : 'Crear Salon'}</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => { setMostrarForm(false); setEditando(null); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Grado</th>
              <th>Seccion</th>
              <th>ID Maestro</th>
              <th>Alumnos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Cargando salones...</td></tr>
            ) : salones.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No hay salones registrados</td></tr>
            ) : (
              salones.map((s) => (
                <tr key={s.id_salon}>
                  <td>{s.id_salon}</td>
                  <td className="td-bold">{s.grado}</td>
                  <td>{s.seccion}</td>
                  <td>{s.id_maestro}</td>
                  <td>{s._count?.alumnos || 0}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon btn-edit" onClick={() => handleEditar(s)} title="Editar"><Edit2 size={16} /></button>
                      <button className="btn-icon btn-danger" onClick={() => handleEliminar(s.id_salon)} title="Eliminar"><Trash2 size={16} /></button>
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
