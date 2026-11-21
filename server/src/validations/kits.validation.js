const { z } = require('zod');

const kitSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre del kit es obligatorio.'),
  descripcion: z.string().trim().nullable().optional(),
  equipoIds: z
    .array(z.uuid('El identificador de un equipo no es válido.'))
    .min(6, 'Selecciona al menos un equipo de cada tipo obligatorio.')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'No puedes seleccionar un mismo equipo más de una vez.',
    }),
}).strict();

const idKitSchema = z.object({
  id: z.uuid('El identificador del kit no es válido.'),
});

module.exports = {kitSchema,idKitSchema,};
