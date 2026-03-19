const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/usuariosController');
const { verificarToken, requiereRol } = require('../middleware/auth');
const admin   = [verificarToken, requiereRol('admin')];

router.get('/',              admin, ctrl.listar);
router.get('/estadisticas',  admin, ctrl.estadisticas);
router.get('/:id',           admin, ctrl.obtener);
router.put('/:id',           admin, ctrl.actualizar);
router.delete('/:id',        admin, ctrl.eliminar);

module.exports = router;
