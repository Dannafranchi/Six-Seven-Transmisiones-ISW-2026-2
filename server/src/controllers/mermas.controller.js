const mermasService = require('../services/mermas.service');

async function listarPorPeriodo(req, res) {
  try {
    const datos = await mermasService.listarPorPeriodo(
      req.query.desde,
      req.query.hasta,
    );
    return res.json(datos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'No se pudieron consultar las mermas.' });
  }
}

module.exports = { listarPorPeriodo };
