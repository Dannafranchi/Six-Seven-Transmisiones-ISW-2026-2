const kitsService = require('../services/kits.service');

function responderError(res, error, mensaje) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: mensaje });
}

async function listar(req, res) {
  try {
    const kits = await kitsService.listarKits();
    return res.json(kits);
  } catch (error) {
    return responderError(res, error, 'No se pudieron listar los kits.');
  }
}

async function crear(req, res) {
  try {
    const kit = await kitsService.crearKit(req.body);
    return res.status(201).json(kit);
  } catch (error) {
    return responderError(res, error, 'No se pudo crear el kit.');
  }
}

async function actualizar(req, res) {
  try {
    const kit = await kitsService.actualizarKit(req.params.id, req.body);

    if (!kit) {
      return res.status(404).json({ message: 'Kit no encontrado.' });
    }
    return res.json(kit);
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el kit.');
  }
}

async function eliminar(req, res) {
  try {
    const eliminado = await kitsService.eliminarKit(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Kit no encontrado.' });
    }
    return res.status(204).end();
  } catch (error) {
    return responderError(res, error, 'No se pudo eliminar el kit.');
  }
}

module.exports = {listar,crear,actualizar,eliminar,};