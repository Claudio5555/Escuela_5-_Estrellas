import React, { useState, useEffect } from 'react';
import { ClipboardCheck, School, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { obtenerSalones } from '../services/estudiantesService';
import { resumenAsistenciaSalon } from '../services/asistenciaService';

export default function MaestroDashboard() {
  const [salones, setSalones] = useState([]);
  const [resumenes, setResumenes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userStr = localStorage.getItem('auth_user');
  let user = null;
  try { user = JSON.parse(userStr); } catch {}

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const salonesData = await obtenerSalones();
      setSalones(salonesData);

      // Cargar resumen de asistencia de hoy para cada salon
      const resumenesTemp = {};
      for (const salon of salonesData) {
        try {
          const resumen = await resumenAsistenciaSalon(salon.id_salon, hoy);
          resumenesTemp[salon.id_salon] = resumen;
        } catch {
          resumenesTemp[salon.id_salon] = null;
        }
      }
      setResumenes(resumenesTemp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel del Maestro</h1>
          <p className="page-subtitle">Bienvenido, {user?.nombre_usuario || 'Maestro'}</p>
        </div>
      </div>

      {error && <div className="alert alert-error"><AlertCircle size={18} /> <span>{error}</span></div>}

      <div className="section-title">Salones Disponibles - Asistencia de Hoy ({hoy})</div>

      {loading ? (
        <div className="empty-state"><p>Cargando salones...</p></div>
      ) : salones.length === 0 ? (
        <div className="empty-state">
          <School size={48} />
          <p>No hay salones disponibles</p>
        </div>
      ) : (
        <div className="salon-cards-grid">
          {salones.map((salon) => {
            const resumen = resumenes[salon.id_salon];
            return (
              <div key={salon.id_salon} className="salon-card" onClick={() => navigate('/asistencia')}>
                <div className="salon-card-header">
                  <School size={24} />
                  <span className="salon-card-title">{salon.grado} - Seccion {salon.seccion}</span>
                </div>
                <div className="salon-card-stats">
                  <div className="salon-stat">
                    <span className="salon-stat-label">Alumnos</span>
                    <span className="salon-stat-value">{salon._count?.alumnos || 0}</span>
                  </div>
                  {resumen && resumen.total_registros > 0 ? (
                    <>
                      <div className="salon-stat">
                        <span className="salon-stat-label">Presentes</span>
                        <span className="salon-stat-value text-success">{resumen.presentes}</span>
                      </div>
                      <div className="salon-stat">
                        <span className="salon-stat-label">Ausentes</span>
                        <span className="salon-stat-value text-danger">{resumen.ausentes}</span>
                      </div>
                      <div className="salon-stat">
                        <span className="salon-stat-label">Asistencia</span>
                        <span className="salon-stat-value">{resumen.porcentaje_asistencia}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="salon-stat">
                      <span className="salon-stat-label text-warning">Sin registrar hoy</span>
                    </div>
                  )}
                </div>
                <button className="btn-primary btn-sm salon-card-btn">
                  <ClipboardCheck size={16} /> Registrar Asistencia
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
