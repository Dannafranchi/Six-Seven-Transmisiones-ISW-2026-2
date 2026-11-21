const resumenService = require('../services/resumen.service');

async function obtenerResumen(req, res) {
  try {
    const resumen = await resumenService.obtenerResumen(req.query.mes);
    res.json(resumen);
  } catch (error) {
    console.error('Error al obtener el resumen', error);
    res.status(500).json({ message: 'No se pudo obtener el resumen del mes' });
  }
}

module.exports = { obtenerResumen };
