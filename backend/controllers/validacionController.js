const { db } = require('../db/database');

async function listarSolicitudes(req, res) {
  try {
    const s = db.prepare(`
      SELECT s.*,u.nombre,u.apellido,u.email,u.telefono,u.fecha_registro,
             r.nombre AS rev_nombre, r.apellido AS rev_apellido
      FROM solicitudes_entrenador s
      JOIN usuarios u ON s.usuario_id=u.id
      LEFT JOIN usuarios r ON s.revisado_por=r.id
      ORDER BY CASE s.estado WHEN 'pendiente' THEN 0 ELSE 1 END, s.fecha_solicitud DESC
    `).all();
    return res.json({ solicitudes: s });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function aprobar(req, res) {
  try {
    const sol = db.prepare('SELECT * FROM solicitudes_entrenador WHERE id=?').get(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'Ya fue procesada.' });
    db.prepare(`UPDATE solicitudes_entrenador SET estado='aprobado',revisado_por=?,fecha_revision=datetime('now') WHERE id=?`).run(req.usuario.id, req.params.id);
    db.prepare(`UPDATE usuarios SET estado='activo' WHERE id=?`).run(sol.usuario_id);
    const u = db.prepare('SELECT nombre,apellido FROM usuarios WHERE id=?').get(sol.usuario_id);
    return res.json({ mensaje: `Entrenador ${u.nombre} ${u.apellido} aprobado.` });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function rechazar(req, res) {
  try {
    const sol = db.prepare('SELECT * FROM solicitudes_entrenador WHERE id=?').get(req.params.id);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'Ya fue procesada.' });
    db.prepare(`UPDATE solicitudes_entrenador SET estado='rechazado',revisado_por=?,fecha_revision=datetime('now'),motivo_rechazo=? WHERE id=?`).run(req.usuario.id, req.body.motivo||'Sin motivo', req.params.id);
    db.prepare(`UPDATE usuarios SET estado='rechazado' WHERE id=?`).run(sol.usuario_id);
    return res.json({ mensaje: 'Solicitud rechazada.' });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function estadisticas(req, res) {
  try {
    const s = db.prepare('SELECT estado,COUNT(*) AS total FROM solicitudes_entrenador GROUP BY estado').all();
    return res.json({ stats: s });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listarSolicitudes, aprobar, rechazar, estadisticas };
