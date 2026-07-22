const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000/api/auth';

export async function registrarUsuario(datosUsuario) {
  const respuesta = await fetch(`${AUTH_API_URL}/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(datosUsuario),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al registrar usuario');
  }
  return data;
}

export async function loginUsuario(credenciales) {
  const respuesta = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credenciales),
  });

  const data = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  return data;
}
