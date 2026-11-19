const express = require('express');
const gastosController = require('../controllers/gastos.controller');
const { validar } = require('../middlewares/validar');
const { subirComprobante } = require('../middlewares/subirComprobante');
const { crearGastoSchema, idGastoSchema } = require('../validations/gastos.validation');

const router = express.Router();

router.get('/', gastosController.listarGastos);
router.get('/opciones', gastosController.obtenerOpciones);
router.post('/', subirComprobante, validar(crearGastoSchema), gastosController.crearGasto);
router.delete('/:id', validar(idGastoSchema, 'params'), gastosController.eliminarGasto);

module.exports = router;

