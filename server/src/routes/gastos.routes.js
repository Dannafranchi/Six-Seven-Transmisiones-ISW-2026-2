const express = require('express');
const gastosController = require('../controllers/gastos.controller');
const { validar } = require('../middlewares/validar');
const { subirComprobante } = require('../middlewares/subirComprobante');
const { crearGastoSchema } = require('../validations/gastos.validation');

const router = express.Router();

router.get('/', gastosController.listarGastos);
router.get('/opciones',gastosController.obtenerOpciones);
router.post('/', subirComprobante, validar(crearGastoSchema),gastosController.crearGasto);


module.exports = router;
