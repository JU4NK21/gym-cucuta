/* ═══════════════════════════════════════
   MIDDLEWARE/AUTH.JS — Verificación JWT
═══════════════════════════════════════ */
const jwt    = require('jsonwebtoken');
const { db } = require('../db/database');

async function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token requerido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await db.get_('SELECT id, rol, estado FROM usuarios WHERE id = ?', [decoded.id]);
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado.' });
    if (usuario.estado !== 'activo') return res.status(403).json({ error: 'Cuenta no activa.' });
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'No autenticado.' });
    if (!roles.includes(req.usuario.rol)) return res.status(403).json({ error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.` });
    next();
  };
}

module.exports = { verificarToken, requiereRol };
