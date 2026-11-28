const { z } = require('zod');

const mesSchema = z.object({
  mes: z
    .string({ error: 'El mes es obligatorio' })
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'El mes debe tener el formato AAAA-MM'),
});

module.exports = { mesSchema };
