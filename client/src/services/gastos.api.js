import { apiFetch } from './api';

export function obtenerGastos() {
  return apiFetch('/gastos');
}
