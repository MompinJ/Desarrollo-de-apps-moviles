// Backend de la version web (NestJS). Ejemplo: http://192.168.1.50:3506/api/v1
// Desde el celular usa la IP de la PC en la red local, no localhost.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 10000;
