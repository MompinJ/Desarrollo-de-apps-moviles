import { ApiError, request } from './http';

const ROL_PACIENTE = 'paciente';

export async function login(email, password) {
  let data;
  try {
    data = await request('/auth/login', { method: 'POST', body: { email, password } });
  } catch (error) {
    if (error.status === 401) {
      throw new ApiError('Correo o contrasena incorrectos', 401);
    }
    if (error.status === 400) {
      throw new ApiError('Revisa el correo y la contrasena', 400);
    }
    throw error;
  }

  // El login del backend acepta cualquier rol; esta app es solo para pacientes.
  if (data.usuario?.rol !== ROL_PACIENTE) {
    throw new ApiError('Esta app es solo para pacientes', 403);
  }

  const { idUsuario, nombre, apellidoPaterno, apellidoMaterno, email: correo, rol } = data.usuario;
  return {
    token: data.access_token,
    usuario: { idUsuario, nombre, apellidoPaterno, apellidoMaterno, email: correo, rol },
  };
}
