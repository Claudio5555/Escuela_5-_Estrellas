import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { obtenerUsuarios, crearUsuario, eliminarUsuario } from '../services/authService';

export default function DirectorUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    contraseña: '',
    rol: 'Maestro',
    id_alumno: ''
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerUsuarios();
      setUsuarios(data);
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
      const datos = {
        ...formData,
        contrasena: formData.contraseña,
        contraseña: formData.contraseña
      };
      if (!datos.id_alumno) delete datos.id_alumno;
      await crearUsuario(datos);
      setExito('Usuario creado exitosamente');
      setFormData({ nombre_usuario: '', correo: '', contraseña: '', rol: 'Maestro', id_alumno: '' });
      setMostrarForm(false);
      cargarUsuarios();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) return;

    try {
      await eliminarUsuario(id);
      setExito('Usuario eliminado correctamente');
      cargarUsuarios();
      setTimeout(() => setExito(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getRolBadgeClass = (rol) => {
    switch (rol) {
      case 'Director': return 'badge badge-director';
      case 'Maestro': return 'badge badge-maestro';
      case 'Alumno': return 'badge badge-alumno';
      default: return 'badge';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Crear y administrar cuentas del sistema</p>
        </div>
        <button className="btn-primary btn-sm" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus size={18} /> Nuevo Usuario
        </button>
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

      {mostrarForm && (
        <div className="form-card animate-fade-in">
          <h3 className="form-card-title">Crear Nuevo Usuario</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre del usuario"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="correo@ejemplo.com"
                  value={formData.correo}
                  onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.contraseña}
                  onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                >
                  <option value="Director">Director / Administrador</option>
                  <option value="Maestro">Maestro / Docente</option>
                  <option value="Alumno">Alumno</option>
                </select>
              </div>
            </div>
            {formData.rol === 'Alumno' && (
              <div className="form-group">
                <label className="form-label">ID del Alumno (del servicio de estudiantes)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="ID del registro de alumno"
                  value={formData.id_alumno}
                  onChange={(e) => setFormData({ ...formData, id_alumno: e.target.value })}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary btn-sm">Crear Usuario</button>
              <button type="button" className="btn-secondary btn-sm" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="table-loading">Cargando usuarios...</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan="6" className="table-empty">No hay usuarios registrados</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td className="td-bold">{u.nombre_usuario}</td>
                  <td>{u.correo}</td>
                  <td><span className={getRolBadgeClass(u.rol)}>{u.rol}</span></td>
                  <td>{new Date(u.fecha_creacion).toLocaleDateString('es-HN')}</td>
                  <td>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleEliminar(u.id_usuario, u.nombre_usuario)}
                      title="Eliminar usuario"
                    >
                      <Trash2 size={16} />
                    </button>
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
