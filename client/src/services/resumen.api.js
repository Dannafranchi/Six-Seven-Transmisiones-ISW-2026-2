import { apiFetch } from './api';

export function obtenerResumen(mes) {
  return apiFetch(`/resumen?mes=${mes}`);
}