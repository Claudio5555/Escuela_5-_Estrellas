const REPORTES_API_URL = import.meta.env.VITE_REPORTES_API_URL || 'http://localhost:3003/api/reportes';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export async function reporteAsistenciaDiaria(fecha) {
  const respuesta = await fetch(`${REPORTES_API_URL}/asistencia-diaria?fecha=${fecha}`, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener reporte diario');
  return data;
}

export async function reporteAsistenciaSalon(id_salon, desde, hasta) {
  let url = `${REPORTES_API_URL}/asistencia-salon/${id_salon}`;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  if (params.length) url += `?${params.join('&')}`;

  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener reporte por salon');
  return data;
}

export async function reporteAlumno(id_alumno, desde, hasta) {
  let url = `${REPORTES_API_URL}/alumno/${id_alumno}`;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  if (params.length) url += `?${params.join('&')}`;

  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener reporte del alumno');
  return data;
}

export async function estadisticasGenerales() {
  const respuesta = await fetch(`${REPORTES_API_URL}/estadisticas-generales`, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener estadisticas');
  return data;
}

export async function alumnosConMasInasistencias(limite) {
  const url = `${REPORTES_API_URL}/inasistencias${limite ? `?limite=${limite}` : ''}`;
  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener inasistencias');
  return data;
}
