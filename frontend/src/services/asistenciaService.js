const ASISTENCIA_API_URL = import.meta.env.VITE_ASISTENCIA_API_URL || 'http://localhost:3002/api/asistencia';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export async function registrarAsistencia(datos) {
  const respuesta = await fetch(`${ASISTENCIA_API_URL}/registrar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al registrar asistencia');
  return data;
}

export async function obtenerAsistenciaSalon(id_salon, fecha) {
  const respuesta = await fetch(`${ASISTENCIA_API_URL}/salon/${id_salon}?fecha=${fecha}`, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener asistencia');
  return data;
}

export async function obtenerAsistenciaAlumno(id_alumno, desde, hasta) {
  let url = `${ASISTENCIA_API_URL}/alumno/${id_alumno}`;
  const params = [];
  if (desde) params.push(`desde=${desde}`);
  if (hasta) params.push(`hasta=${hasta}`);
  if (params.length) url += `?${params.join('&')}`;

  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener asistencia del alumno');
  return data;
}

export async function actualizarAsistencia(id, datos) {
  const respuesta = await fetch(`${ASISTENCIA_API_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(datos),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al actualizar asistencia');
  return data;
}

export async function resumenAsistenciaSalon(id_salon, fecha) {
  let url = `${ASISTENCIA_API_URL}/resumen/salon/${id_salon}`;
  if (fecha) url += `?fecha=${fecha}`;

  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener resumen');
  return data;
}
