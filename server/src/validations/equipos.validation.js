const { z } = require('zod');
const { TipoEquipo, EstadoEquipo } = require('@prisma/client');

const equipoSchema = z.object({
  nombre: z.string().trim().min(4, 'El nombre es obligatorio.'),
  modelo: z.string().trim().min(2, 'El modelo es obligatorio.'),
  anio: z
    .number()
    .int('El año debe ser un número entero.')
    .min(1980, 'El año debe ser desde 1980 en adelante.')
    .max(new Date().getFullYear(), 'El año no puede estar en el futuro.')
    .nullable()
    .optional(),
  precioCompra: z
    .number()
    .int('El precio debe ser un número entero.')
    .min(0, 'El precio debe ser igual o mayor a $0.')
    .max(999999999999, 'El precio supera el máximo permitido.'),
  tipo: z.enum(Object.values(TipoEquipo), {
    error: 'Selecciona un tipo válido.',
  }),
}).strict();

const idEquipoSchema = z.object({
  id: z.uuid('El identificador del equipo no es válido.'),
});

const cerrarReparacionSchema = z.object({
  costo: z
    .number()
    .int('El costo debe ser un número entero.')
    .min(0, 'El costo no puede ser negativo.')
    .max(999999999999, 'El costo supera el máximo permitido.'),
  estadoFinal: z.enum(
    [EstadoEquipo.BUENO, EstadoEquipo.INHABILITADO],
    { error: 'Elige BUENO o INHABILITADO como estado final.' },
  ),
}).strict();

const cambiarEstadoDirectoSchema = z.object({
  estado: z.enum(
    [EstadoEquipo.BUENO, EstadoEquipo.INHABILITADO],
    { error: 'Selecciona un estado válido.' },
  ),
}).strict();

module.exports = {
  equipoSchema,
  idEquipoSchema,
  cerrarReparacionSchema,
  cambiarEstadoDirectoSchema,
};