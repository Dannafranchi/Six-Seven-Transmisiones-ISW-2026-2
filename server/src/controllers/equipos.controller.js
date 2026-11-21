const equiposService = require('../services/equipos.service');

function responderError(res, error, mensaje) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: mensaje });
}

async function listar(req, res) {
  try {
    const equipos = await equiposService.listarEquipos();
    return res.json(equipos);
  } catch (error) {
    return responderError(res, error, 'No se pudieron listar los equipos.');
  }
}

async function crear(req, res) {
  try {
    const equipo = await equiposService.crearEquipo(req.body);
    return res.status(201).json(equipo);
  } catch (error) {
    return responderError(res, error, 'No se pudo crear el equipo.');
  }
}

async function actualizar(req, res) {
  try {
    const equipo = await equiposService.actualizarEquipo(req.params.id, req.body);

    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado o archivado.' });
    }
    return res.json(equipo);
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el equipo.');
  }
}

async function iniciarReparacion(req, res) {
  try {
    const equipo = await equiposService.iniciarReparacion(req.params.id);

    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado o archivado.' });
    }
    return res.status(201).json(equipo);
  } catch (error) {
    return responderError(res, error, 'No se pudo iniciar la reparación.');
  }
}

async function cerrarReparacion(req, res) {
  try {
    const equipo = await equiposService.cerrarReparacion(req.params.id, req.body);

    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado o archivado.' });
    }
    return res.json(equipo);
  } catch (error) {
    return responderError(res, error, 'No se pudo cerrar la reparación.');
  }
}

async function eliminar(req, res) {
  try {
    const archivado = await equiposService.archivarEquipo(req.params.id);

    if (!archivado) {
      return res.status(404).json({ message: 'Equipo no encontrado o ya archivado.' });
    }
    return res.status(204).end();
  } catch (error) {
    return responderError(res, error, 'No se pudo dar de baja el equipo.');
  }
}

async function cambiarEstadoDirecto(req, res) {
  try {
    const equipo = await equiposService.cambiarEstadoDirecto(
      req.params.id,
      req.body.estado,
    );

    if (!equipo) {
      return res.status(404).json({ message: 'Equipo no encontrado o archivado.' });
    }
    return res.json(equipo);
  } catch (error) {
    return responderError(res, error, 'No se pudo cambiar el estado.');
  }
}

module.exports = {listar,crear,actualizar,iniciarReparacion,cerrarReparacion,
  eliminar,cambiarEstadoDirecto,
};