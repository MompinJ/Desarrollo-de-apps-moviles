import { request } from './http';

// El backend saca al paciente del JWT: no se manda id, asi que solo regresa los datos propios.
export function getMiPerfil(token) {
  return request('/pacientes/me', { token });
}
