const { db } = require('../db/database');

async function listar(req,res) {
  try { return res.json({ usuarios: db.prepare('SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios ORDER BY fecha_registro DESC').all() }); }
  catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}
async function obtener(req,res) {
  try {
    const u = db.prepare('SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios WHERE id=?').get(req.params.id);
    if (!u) return res.status(404).json({ error:'No encontrado.' });
    return res.json({ usuario:u });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}
async function actualizar(req,res) {
  try {
    const { nombre,apellido,telefono,estado } = req.body;
    if (!db.prepare('SELECT id FROM usuarios WHERE id=?').get(req.params.id)) return res.status(404).json({ error:'No encontrado.' });
    db.prepare(`UPDATE usuarios SET nombre=COALESCE(?,nombre),apellido=COALESCE(?,apellido),telefono=COALESCE(?,telefono),estado=COALESCE(?,estado),fecha_actualizacion=datetime('now') WHERE id=?`)
      .run(nombre||null,apellido||null,telefono||null,estado||null,req.params.id);
    return res.json({ mensaje:'Actualizado.', usuario: db.prepare('SELECT id,nombre,apellido,email,rol,estado FROM usuarios WHERE id=?').get(req.params.id) });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}
async function eliminar(req,res) {
  try {
    const u = db.prepare('SELECT rol FROM usuarios WHERE id=?').get(req.params.id);
    if (!u) return res.status(404).json({ error:'No encontrado.' });
    if (u.rol==='admin' && parseInt(req.params.id)===req.usuario.id) return res.status(400).json({ error:'No puedes eliminarte a ti mismo.' });
    db.prepare('DELETE FROM usuarios WHERE id=?').run(req.params.id);
    return res.json({ mensaje:'Eliminado.' });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}
async function estadisticas(req,res) {
  try {
    return res.json({ totales: db.prepare('SELECT rol,estado,COUNT(*) AS total FROM usuarios GROUP BY rol,estado').all(), totalUsuarios: db.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}
module.exports = { listar, obtener, actualizar, eliminar, estadisticas };
