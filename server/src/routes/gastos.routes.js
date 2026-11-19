const express = require('express');
const gastosController = require('../controllers/gastos.controller');
const { validar } = require('../middlewares/validar');
const { subirComprobante } = require('../middlewares/subirComprobante');
const { gastoSchema, idGastoSchema} = require('../validations/gastos.validation');

const router = express.Router();

router.get('/', gastosController.listarGastos);
router.get('/opciones', gastosController.obtenerOpciones);
router.post('/', subirComprobante, validar(gastoSchema), gastosController.crearGasto);
router.put(
    '/:id',
    subirComprobante,
    validar(idGastoSchema, 'params'),
    validar(gastoSchema),
    gastosController.actualizarGasto,
);
router.delete('/:id', validar(idGastoSchema, 'params'), gastosController.eliminarGasto);

module.exports = router;

