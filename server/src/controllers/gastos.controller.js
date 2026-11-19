const gastosService = require('../services/gastos.service');

async function listarGastos(req, res) {
  try {
    const gastos = await gastosService.listarGastos();
    res.json(gastos);
  } catch (error) {
    console.error('Error al listar gastos:', error);
    res.status(500).json({ message: 'No se pudieron obtener los gastos' });
  }
}

async function obtenerOpciones(req, res) {
  try {
    const opciones = await gastosService.obtenerOpciones();
    res.json(opciones);

  } catch(error){
    console.error('Error al obtener opciones', error);
    res.status(500).json({ message: 'No se pudieron obtener las opciones' });
  }
}

async function crearGasto(req, res) {
  try{
    const gastoCreado = await gastosService.crearGasto({
     ...req.body,
     comprobante: req.file?.filename,
    });
    res.status(201).json(gastoCreado);
  } catch(error){
    console.error('Error al crear el Gasto', error);
    res.status(500).json({message: 'No se pudo ingresar un Nuevo Gasto'})
  }
}

async function actualizarGasto(req, res) {
  try {
    const gastoActualizado = await gastosService.actualizarGasto(
      req.params.id,
      req.body,
      req.file?.filename,
    );
    res.json(gastoActualizado);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error al actualizar el Gasto', error);
    res.status(500).json({ message: 'No se pudo actualizar el gasto' });
  }
}


async function eliminarGasto(req, res) {
  try {
    await gastosService.eliminarGasto(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error al eliminar el Gasto', error);
    res.status(500).json({ message: 'No se pudo eliminar el gasto' });
  }
}

module.exports = { listarGastos, obtenerOpciones, crearGasto, actualizarGasto, eliminarGasto };
