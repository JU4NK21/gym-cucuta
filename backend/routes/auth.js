/* ═══════════════════════════════════════
   ROUTES/AUTH
═══════════════════════════════════════ */
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/registro', ctrl.registro);
router.post('/login',    ctrl.login);
router.get('/perfil',    verificarToken, ctrl.perfil);

module.exports = router;
