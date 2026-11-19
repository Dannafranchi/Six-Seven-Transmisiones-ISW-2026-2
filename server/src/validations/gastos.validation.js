const { z } = require('zod');
const { TipoGasto } = require('@prisma/client');
const hoyEnChile = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());

const gastoSchema = z
  .object({
    tipo: z.enum(Object.values(TipoGasto), { error: 'Elige un tipo de gasto válido' }),
    descripcion: z
      .string({ error: 'La descripción es obligatoria' })
      .trim()
      .min(1, 'La descripción es obligatoria')
      .max(255, 'La descripción no puede superar los 255 caracteres'),
    valor: z.coerce
      .number({ error: 'El valor debe ser un número' })
      .int('El valor debe ser un número entero')
      .positive('El valor debe ser mayor que 0'),
    fecha: z.coerce
      .date({ error: 'La fecha no es válida' })
      .refine((fecha) => fecha.toISOString().slice(0, 10) <= hoyEnChile(), 'La fecha no puede ser posterior a hoy')
      .optional(),
    transmisionId: z.uuid('La transmisión no es válida').optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.transmisionId) {
      if (!datos.tipo.startsWith('TRANSMISION_')) {
        ctx.addIssue({ code: 'custom', path: ['tipo'], message: 'Tipo no válido para un gasto de transmisión' });
      }
    } else {
      if (!datos.tipo.startsWith('GENERAL_')) {
        ctx.addIssue({ code: 'custom', path: ['tipo'], message: 'Tipo no válido para un gasto general' });
      }
      if (!datos.fecha) {
        ctx.addIssue({ code: 'custom', path: ['fecha'], message: 'La fecha es obligatoria en un gasto general' });
      }
    }
  });

const idGastoSchema = z.object({
  id: z.uuid('El id del gasto no es válido'),
});

module.exports = { gastoSchema, idGastoSchema };

