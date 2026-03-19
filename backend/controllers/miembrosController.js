/* ═══════════════════════════════════════
   CONTROLLERS/MIEMBROS — Miembros del gym
═══════════════════════════════════════ */
const { db } = require('../db/database');

function listar(req, res) {
  try {
    const m = db.prepare('SELECT * FROM miembros_gym ORDER BY fecha_registro DESC').all();
    return res.json({ miembros: m });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

function crear(req, res) {
  try {
    const { nombres, apellidos, cedula, telefono, email, plan, vence, estado, notas } = req.body;
    if (!nombres || !apellidos || !cedula)
      return res.status(400).json({ error: 'Nombres, apellidos y cédula son obligatorios.' });

    const existe = db.prepare('SELECT id FROM miembros_gym WHERE cedula = ?').get(cedula);
    if (existe) return res.status(409).json({ error: 'Ya existe un miembro con esa cédula.' });

    const r = db.prepare(`
      INSERT INTO miembros_gym (nombres,apellidos,cedula,telefono,email,plan,vence,estado,notas)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(nombres, apellidos, cedula, telefono||'', email||'', plan||'', vence||'', estado||'Activo', notas||'');

    const nuevo = db.prepare('SELECT * FROM miembros_gym WHERE id = ?').get(r.lastInsertRowid);
    return res.status(201).json({ mensaje: 'Miembro registrado.', miembro: nuevo });
  } catch(e) { console.error(e); return res.status(500).json({ error: 'Error interno.' }); }
}

function actualizar(req, res) {
  try {
    const { nombres, apellidos, telefono, email, plan, vence, estado, notas } = req.body;
    const existe = db.prepare('SELECT id FROM miembros_gym WHERE id = ?').get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Miembro no encontrado.' });

    db.prepare(`
      UPDATE miembros_gym SET
        nombres=COALESCE(?,nombres), apellidos=COALESCE(?,apellidos),
        telefono=COALESCE(?,telefono), email=COALESCE(?,email),
        plan=COALESCE(?,plan), vence=COALESCE(?,vence),
        estado=COALESCE(?,estado), notas=COALESCE(?,notas)
      WHERE id=?
    `).run(nombres||null, apellidos||null, telefono||null, email||null,
           plan||null, vence||null, estado||null, notas||null, req.params.id);

    const m = db.prepare('SELECT * FROM miembros_gym WHERE id = ?').get(req.params.id);
    return res.json({ mensaje: 'Miembro actualizado.', miembro: m });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

function eliminar(req, res) {
  try {
    const existe = db.prepare('SELECT id FROM miembros_gym WHERE id = ?').get(req.params.id);
    if (!existe) return res.status(404).json({ error: 'Miembro no encontrado.' });
    db.prepare('DELETE FROM miembros_gym WHERE id = ?').run(req.params.id);
    return res.json({ mensaje: 'Miembro eliminado.' });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

function estadisticas(req, res) {
  try {
    const total   = db.prepare('SELECT COUNT(*) AS total FROM miembros_gym').get();
    const activos = db.prepare("SELECT COUNT(*) AS total FROM miembros_gym WHERE estado='Activo'").get();
    const planes  = db.prepare('SELECT plan, COUNT(*) AS total FROM miembros_gym GROUP BY plan').all();
    const hoy     = new Date().toISOString().split('T')[0];
    const nuevosHoy = db.prepare('SELECT COUNT(*) AS total FROM miembros_gym WHERE fecha_registro = ?').get(hoy);

    return res.json({
      total:      total.total,
      activos:    activos.total,
      inactivos:  total.total - activos.total,
      nuevosHoy:  nuevosHoy.total,
      planes
    });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listar, crear, actualizar, eliminar, estadisticas };
