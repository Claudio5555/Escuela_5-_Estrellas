const ESTUDIANTES_API_URL = import.meta.env.VITE_ESTUDIANTES_API_URL || 'http://localhost:3001/api';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

// --- Salones ---
export async function obtenerSalones() {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/salones`, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener salones');
  return data;
}

export async function crearSalon(datosSalon) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/salones`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosSalon),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al crear salon');
  return data;
}

export async function actualizarSalon(id, datosSalon) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/salones/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosSalon),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al actualizar salon');
  return data;
}

export async function eliminarSalon(id) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/salones/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al eliminar salon');
  return data;
}

// --- Alumnos ---
export async function obtenerAlumnos(id_salon) {
  const url = id_salon
    ? `${ESTUDIANTES_API_URL}/alumnos?id_salon=${id_salon}`
    : `${ESTUDIANTES_API_URL}/alumnos`;
  const respuesta = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al obtener alumnos');
  return data;
}

export async function crearAlumno(datosAlumno) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/alumnos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosAlumno),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al crear alumno');
  return data;
}

export async function actualizarAlumno(id, datosAlumno) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/alumnos/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosAlumno),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al actualizar alumno');
  return data;
}

export async function eliminarAlumno(id) {
  const respuesta = await fetch(`${ESTUDIANTES_API_URL}/alumnos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await respuesta.json();
  if (!respuesta.ok) throw new Error(data.error || 'Error al eliminar alumno');
  return data;
}
