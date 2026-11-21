const express = require('express');
const kitsController = require('../controllers/kits.controller');
const { validar } = require('../middlewares/validar');
const { idKitSchema, kitSchema } = require('../validations/kits.validation');

const router = express.Router();

router.get('/', kitsController.listar);
router.post('/', validar(kitSchema), kitsController.crear);

router.put(
  '/:id',
  validar(idKitSchema, 'params'),
  validar(kitSchema),
  kitsController.actualizar,
);

router.delete(
  '/:id',
  validar(idKitSchema, 'params'),
  kitsController.eliminar,
);

module.exports = router;