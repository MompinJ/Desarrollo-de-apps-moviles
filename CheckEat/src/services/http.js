import { API_URL, REQUEST_TIMEOUT_MS } from '../config/api';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// El backend envuelve todo en { success, data, message, statusCode, timestamp }.
export async function request(path, { method = 'GET', body, token } = {}) {
  if (!API_URL) {
    throw new ApiError('Falta configurar EXPO_PUBLIC_API_URL', 0);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor', 0);
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new ApiError(json?.message ?? `Error ${res.status}`, res.status);
  }
  return json.data;
}
