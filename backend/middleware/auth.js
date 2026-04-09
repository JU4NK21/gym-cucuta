const jwt    = require('jsonwebtoken');
const { query } = require('../db/database');

async function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await query('SELECT id,rol,estado FROM usuarios WHERE id=$1', [decoded.id]);
    const u = rows[0];
    if (!u) return res.status(401).json({ error: 'Usuario no encontrado.' });
    if (u.estado !== 'activo') return res.status(403).json({ error: 'Cuenta no activa.' });
    req.usuario = decoded;
    next();
  } catch { return res.status(401).json({ error: 'Token inválido.' }); }
}

function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) return res.status(401).json({ error: 'No autenticado.' });
    if (!roles.includes(req.usuario.rol)) return res.status(403).json({ error: 'Acceso denegado.' });
    next();
  };
}

module.exports = { verificarToken, requiereRol };
