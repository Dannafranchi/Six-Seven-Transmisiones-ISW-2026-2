const express = require('express');
const mermasController = require('../controllers/mermas.controller');
const { validar } = require('../middlewares/validar');
const { periodoSchema } = require('../validations/mermas.validation');

const router = express.Router();

router.get('/', validar(periodoSchema, 'query'), mermasController.listarPorPeriodo);

module.exports = router;
