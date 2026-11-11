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
  nombre: z.string().trim().min(1, 'El nombre es obligatorio.'),
  modelo: z.string().trim().min(1, 'El modelo es obligatorio.'),
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

function validarEquipo(req, res, next) {
  const resultado = equipoSchema.safeParse(req.body);

  if (!resultado.success) {
    return res.status(400).json({
      error: 'Los datos del equipo no son válidos.',
      detalles: resultado.error.issues.map((problema) => ({
        campo: problema.path.join('.'),
        mensaje: problema.message,
      })),
    });
  }

  req.body = resultado.data;
  return next();
}

module.exports = { validarEquipo };