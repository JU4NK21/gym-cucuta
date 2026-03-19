/* ═══════════════════════════════════════
   ROUTES/USUARIOS — Solo admin
═══════════════════════════════════════ */
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/usuariosController');
const { verificarToken, requiereRol } = require('../middleware/auth');

const soloAdmin = [verificarToken, requiereRol('admin')];

router.get('/',                soloAdmin, ctrl.listar);
router.get('/estadisticas',    soloAdmin, ctrl.estadisticas);
router.get('/:id',             soloAdmin, ctrl.obtener);
router.put('/:id',             soloAdmin, ctrl.actualizar);
router.delete('/:id',          soloAdmin, ctrl.eliminar);

module.exports = router;
