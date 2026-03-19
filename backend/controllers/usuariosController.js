/* ═══════════════════════════════════════
   CONTROLLERS/USUARIOS (sqlite3 async)
═══════════════════════════════════════ */
const { db } = require('../db/database');

async function listar(req, res) {
  try {
    const usuarios = await db.all_('SELECT id, nombre, apellido, email, rol, estado, telefono, fecha_registro FROM usuarios ORDER BY fecha_registro DESC');
    return res.json({ usuarios });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function obtener(req, res) {
  try {
    const u = await db.get_('SELECT id, nombre, apellido, email, rol, estado, telefono, fecha_registro FROM usuarios WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ usuario: u });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function actualizar(req, res) {
  try {
    const { nombre, apellido, telefono, estado } = req.body;
    const existe = await db.get_('SELECT id FROM usuarios WHERE id = ?', [req.params.id]);
    if (!existe) return res.status(404).json({ error: 'Usuario no encontrado.' });
    await db.run_(
      `UPDATE usuarios SET nombre=COALESCE(?,nombre), apellido=COALESCE(?,apellido), telefono=COALESCE(?,telefono), estado=COALESCE(?,estado), fecha_actualizacion=datetime('now') WHERE id=?`,
      [nombre||null, apellido||null, telefono||null, estado||null, req.params.id]
    );
    const u = await db.get_('SELECT id, nombre, apellido, email, rol, estado, telefono FROM usuarios WHERE id = ?', [req.params.id]);
    return res.json({ mensaje: 'Usuario actualizado.', usuario: u });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function eliminar(req, res) {
  try {
    const u = await db.get_('SELECT rol FROM usuarios WHERE id = ?', [req.params.id]);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    if (u.rol === 'admin' && parseInt(req.params.id) === req.usuario.id)
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta de admin.' });
    await db.run_('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    return res.json({ mensaje: 'Usuario eliminado.' });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function estadisticas(req, res) {
  try {
    const totales = await db.all_('SELECT rol, estado, COUNT(*) AS total FROM usuarios GROUP BY rol, estado');
    const total   = await db.get_('SELECT COUNT(*) AS total FROM usuarios');
    return res.json({ totales, totalUsuarios: total.total });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listar, obtener, actualizar, eliminar, estadisticas };
