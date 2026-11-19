const { z } = require('zod');

const tiposPermitidos = [
  'CAMARA',
  'TRIPODE',
  'MICROFONO',
  'PANEL_SONIDO',
  'CABLE',
  'PANEL_SWITCH',
  'OTRO',
];

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
  tipo: z.enum(tiposPermitidos, {
    errorMap: () => ({ message: 'Selecciona un tipo válido.' }),
  }),
}).strict();

const idEquipoSchema = z.object({
  id: z.string().uuid('El identificador del equipo no es válido.'),
});

function validarIdEquipo(req, res, next) {
  const resultado = idEquipoSchema.safeParse(req.params);

  if (!resultado.success) {
    return res.status(400).json({
      error: 'El ID del equipo no es válido.',
      detalles: resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.'),
        mensaje: problema.message,
      })),
    });
  }

  return next();
}

module.exports = { validarEquipo, validarIdEquipo };