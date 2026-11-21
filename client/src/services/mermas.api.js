import { apiFetch } from './api';

export function obtenerMermasPorPeriodo(desde, hasta) {
  const parametros = new URLSearchParams({ desde, hasta });
  return apiFetch(`/mermas?${parametros}`);
}
