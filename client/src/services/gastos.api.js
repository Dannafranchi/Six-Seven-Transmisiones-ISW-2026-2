import { apiFetch } from './api';

export function obtenerGastos() {
  return apiFetch('/gastos');
}

export function obtenerOpciones() {
  return apiFetch('/gastos/opciones')
}

export function crearGasto(datos) {
  return apiFetch('/gastos', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}