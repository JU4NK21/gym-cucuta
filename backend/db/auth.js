/* ═══════════════════════════════════════
   MIDDLEWARE/AUTH.JS — Verificación JWT y roles
═══════════════════════════════════════ */
const jwt = require('jsonwebtoken');
const db  = require('../db/database');

/* ── Verificar token ── */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario sigue activo en la BD
    const usuario = db.prepare('SELECT id, rol, estado FROM usuarios WHERE id = ?').get(decoded.id);
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ error: 'Cuenta no activa o pendiente de aprobación.' });
    }

    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

/* ── Verificar rol específico ── */
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.` });
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
