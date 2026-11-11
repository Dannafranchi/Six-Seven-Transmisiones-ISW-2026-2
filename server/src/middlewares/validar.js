function validar(schema, origen = 'body') {
  return (req, res, next) => {
    const resultado = schema.safeParse(req[origen]);

    if (!resultado.success) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errores: resultado.error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        })),
      });
    }

    req[origen] = resultado.data;
    next();
  };
}

module.exports = { validar };
