import { apiFetch } from './api';

export function obtenerKits() {
  return apiFetch('/kits');
}

export function crearKit(datos) {
  return apiFetch('/kits', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function modificarKit(id, datos) {
  return apiFetch(`/kits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}

export function eliminarKit(id) {
  return apiFetch(`/kits/${id}`, { method: 'DELETE' });
}
