import { apiFetch } from './api';

export function obtenerEquipos() {
  return apiFetch('/equipos');
}

export function crearEquipo(datos) {
  return apiFetch('/equipos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export function eliminarEquipo(id) {
  return apiFetch(`/equipos/${id}`, { method: 'DELETE'});
}

export function modificarEquipo(id, datos) {
  return apiFetch(`/equipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datos),
  });
}