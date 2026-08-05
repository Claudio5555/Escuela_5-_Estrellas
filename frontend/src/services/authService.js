const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api/auth';

function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

export async function loginUsuario(credenciales) {
  const respuesta = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al iniciar sesion');
  }
  return data;
}

export async function obtenerPerfil() {
  const respuesta = await fetch(`${AUTH_API_URL}/perfil`, {
    headers: getAuthHeaders(),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al obtener el perfil');
  }
  return data;
}

export async function obtenerUsuarios() {
  const respuesta = await fetch(`${AUTH_API_URL}/usuarios`, {
    headers: getAuthHeaders(),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al obtener usuarios');
  }
  return data;
}

export async function crearUsuario(datosUsuario) {
  const respuesta = await fetch(`${AUTH_API_URL}/registro`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(datosUsuario),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al crear usuario');
  }
  return data;
}

export async function eliminarUsuario(id) {
  const respuesta = await fetch(`${AUTH_API_URL}/usuarios/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al eliminar usuario');
  }
  return data;
}
