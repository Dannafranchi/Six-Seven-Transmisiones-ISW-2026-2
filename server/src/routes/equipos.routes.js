
const express = require('express');
const equiposController = require('../controllers/equipos.controller');

const router = express.Router();

router.get('/', equiposController.listar);
router.post('/', equiposController.crear);

module.exports = router;
