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

module.exports = { listarGastos, obtenerOpciones};
