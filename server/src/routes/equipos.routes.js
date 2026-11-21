const express = require('express');
const equiposController = require('../controllers/equipos.controller');
const { validar } = require('../middlewares/validar');
const {
  equipoSchema,
  idEquipoSchema,
  cerrarReparacionSchema,
  cambiarEstadoDirectoSchema,
} = require('../validations/equipos.validation');

const router = express.Router();

router.get('/', equiposController.listar);
router.post('/', validar(equipoSchema), equiposController.crear);

router.put(
  '/:id',
  validar(idEquipoSchema, 'params'),
  validar(equipoSchema),
  equiposController.actualizar,
);

router.patch(
  '/:id/estado',
  validar(idEquipoSchema, 'params'),
  validar(cambiarEstadoDirectoSchema),
  equiposController.cambiarEstadoDirecto,
);

router.delete(
  '/:id',
  validar(idEquipoSchema, 'params'),
  equiposController.eliminar,
);

router.post(
  '/:id/reparaciones',
  validar(idEquipoSchema, 'params'),
  equiposController.iniciarReparacion,
);

router.put(
  '/:id/reparaciones/cerrar',
  validar(idEquipoSchema, 'params'),
  validar(cerrarReparacionSchema),
  equiposController.cerrarReparacion,
);

module.exports = router;