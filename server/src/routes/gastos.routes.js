const express = require('express');
const gastosController = require('../controllers/gastos.controller');

const router = express.Router();

router.get('/', gastosController.listarGastos);

module.exports = router;
