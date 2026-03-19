const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/miembrosController');
const { verificarToken, requiereRol } = require('../middleware/auth');

const auth      = [verificarToken];
const adminEntrenador = [verificarToken, requiereRol('admin','entrenador')];

router.get('/',             auth,            ctrl.listar);
router.get('/estadisticas', auth,            ctrl.estadisticas);
router.post('/',            adminEntrenador, ctrl.crear);
router.put('/:id',          adminEntrenador, ctrl.actualizar);
router.delete('/:id',       adminEntrenador, ctrl.eliminar);

module.exports = router;
