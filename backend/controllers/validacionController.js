/* ═══════════════════════════════════════
   CONTROLLERS/VALIDACION (sqlite3 async)
═══════════════════════════════════════ */
const { db } = require('../db/database');

async function listarSolicitudes(req, res) {
  try {
    const solicitudes = await db.all_(`
      SELECT s.id, s.estado, s.fecha_solicitud, s.fecha_revision, s.motivo_rechazo,
             u.id AS usuario_id, u.nombre, u.apellido, u.email, u.telefono, u.fecha_registro,
             r.nombre AS revisado_por_nombre, r.apellido AS revisado_por_apellido
      FROM solicitudes_entrenador s
      JOIN usuarios u ON s.usuario_id = u.id
      LEFT JOIN usuarios r ON s.revisado_por = r.id
      ORDER BY CASE s.estado WHEN 'pendiente' THEN 0 ELSE 1 END, s.fecha_solicitud DESC
    `);
    return res.json({ solicitudes });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function aprobar(req, res) {
  try {
    const { id } = req.params;
    const sol = await db.get_('SELECT * FROM solicitudes_entrenador WHERE id = ?', [id]);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'La solicitud ya fue procesada.' });

    await db.run_(`UPDATE solicitudes_entrenador SET estado='aprobado', revisado_por=?, fecha_revision=datetime('now') WHERE id=?`, [req.usuario.id, id]);
    await db.run_(`UPDATE usuarios SET estado='activo' WHERE id=?`, [sol.usuario_id]);

    const u = await db.get_('SELECT nombre, apellido, email FROM usuarios WHERE id = ?', [sol.usuario_id]);
    return res.json({ mensaje: `Entrenador ${u.nombre} ${u.apellido} aprobado exitosamente.`, usuario: u });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function rechazar(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const sol = await db.get_('SELECT * FROM solicitudes_entrenador WHERE id = ?', [id]);
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'La solicitud ya fue procesada.' });

    await db.run_(`UPDATE solicitudes_entrenador SET estado='rechazado', revisado_por=?, fecha_revision=datetime('now'), motivo_rechazo=? WHERE id=?`, [req.usuario.id, motivo || 'Sin motivo', id]);
    await db.run_(`UPDATE usuarios SET estado='rechazado' WHERE id=?`, [sol.usuario_id]);
    return res.json({ mensaje: 'Solicitud rechazada.' });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function estadisticas(req, res) {
  try {
    const stats = await db.all_('SELECT estado, COUNT(*) AS total FROM solicitudes_entrenador GROUP BY estado');
    return res.json({ stats });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listarSolicitudes, aprobar, rechazar, estadisticas };
