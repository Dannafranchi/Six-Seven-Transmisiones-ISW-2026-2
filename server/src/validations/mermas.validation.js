const { z } = require('zod');

const periodoSchema = z.object({
  desde: z.iso.datetime(),
  hasta: z.iso.datetime(),
}).strict().refine(
  ({ desde, hasta }) => new Date(desde) < new Date(hasta),
  { message: 'El fin del período debe ser posterior al inicio.', path: ['hasta'] },
);

module.exports = { periodoSchema };
