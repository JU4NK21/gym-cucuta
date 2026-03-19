/* ═══════════════════════════════════════
   ROUTES/VALIDACION — Solo admin
═══════════════════════════════════════ */
const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/validacionController');
const { verificarToken, requiereRol } = require('../middleware/auth');

const soloAdmin = [verificarToken, requiereRol('admin')];

router.get('/',                soloAdmin, ctrl.listarSolicitudes);
router.get('/estadisticas',    soloAdmin, ctrl.estadisticas);
router.put('/:id/aprobar',     soloAdmin, ctrl.aprobar);
router.put('/:id/rechazar',    soloAdmin, ctrl.rechazar);

module.exports = router;
