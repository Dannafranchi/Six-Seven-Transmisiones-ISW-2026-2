const equiposService = require('../services/equipos.service');

async function listar(req, res) {
  try {
    const equipos = await equiposService.listarEquipos();
    return res.json(equipos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'No se pudieron listar los equipos.' });
  }
}

async function crear(req, res) {
  try {
    const equipo = await equiposService.crearEquipo(req.body);
    return res.status(201).json(equipo);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'No se pudo crear el artefacto.' });
  }
}

module.exports = { listar, crear };
