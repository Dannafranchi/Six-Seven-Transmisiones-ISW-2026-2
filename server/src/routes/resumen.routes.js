const express = require('express');
const resumenController = require('../controllers/resumen.controller');
const { validar } = require('../middlewares/validar');
const { mesSchema } = require('../validations/resumen.validation');

const router = express.Router();

router.get('/', validar(mesSchema, 'query'), resumenController.obtenerResumen);

module.exports = router;
