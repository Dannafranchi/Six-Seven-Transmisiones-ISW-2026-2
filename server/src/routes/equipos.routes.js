
const express = require('express');
const equiposController = require('../controllers/equipos.controller');
const { validarEquipo } = require('../middlewares/equipos.middlewares');
const router = express.Router();

router.get('/', equiposController.listar);
router.post('/', validarEquipo, equiposController.crear);

module.exports = router;


