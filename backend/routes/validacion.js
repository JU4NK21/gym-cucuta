const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/validacionController');
const { verificarToken, requiereRol } = require('../middleware/auth');
const admin   = [verificarToken, requiereRol('admin')];

router.get('/',             admin, ctrl.listarSolicitudes);
router.get('/estadisticas', admin, ctrl.estadisticas);
router.put('/:id/aprobar',  admin, ctrl.aprobar);
router.put('/:id/rechazar', admin, ctrl.rechazar);

module.exports = router;
