const { query } = require('../db/database');

async function listarSolicitudes(req, res) {
  try {
    const { rows } = await query(`
      SELECT s.*,u.nombre,u.apellido,u.email,u.telefono,u.fecha_registro,
             r.nombre AS rev_nombre, r.apellido AS rev_apellido
      FROM solicitudes_entrenador s
      JOIN usuarios u ON s.usuario_id=u.id
      LEFT JOIN usuarios r ON s.revisado_por=r.id
      ORDER BY CASE s.estado WHEN 'pendiente' THEN 0 ELSE 1 END, s.fecha_solicitud DESC
    `);
    return res.json({ solicitudes: rows });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function aprobar(req, res) {
  try {
    const { rows } = await query('SELECT * FROM solicitudes_entrenador WHERE id=$1', [req.params.id]);
    const sol = rows[0];
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'Ya fue procesada.' });

    await query(
      `UPDATE solicitudes_entrenador SET estado='aprobado',revisado_por=$1,fecha_revision=NOW() WHERE id=$2`,
      [req.usuario.id, req.params.id]
    );
    await query(`UPDATE usuarios SET estado='activo' WHERE id=$1`, [sol.usuario_id]);

    const u = await query('SELECT nombre,apellido FROM usuarios WHERE id=$1', [sol.usuario_id]);
    const usr = u.rows[0];
    return res.json({ mensaje: `Entrenador ${usr.nombre} ${usr.apellido} aprobado.` });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function rechazar(req, res) {
  try {
    const { rows } = await query('SELECT * FROM solicitudes_entrenador WHERE id=$1', [req.params.id]);
    const sol = rows[0];
    if (!sol) return res.status(404).json({ error: 'Solicitud no encontrada.' });
    if (sol.estado !== 'pendiente') return res.status(400).json({ error: 'Ya fue procesada.' });

    await query(
      `UPDATE solicitudes_entrenador SET estado='rechazado',revisado_por=$1,fecha_revision=NOW(),motivo_rechazo=$2 WHERE id=$3`,
      [req.usuario.id, req.body.motivo||'Sin motivo', req.params.id]
    );
    await query(`UPDATE usuarios SET estado='rechazado' WHERE id=$1`, [sol.usuario_id]);
    return res.json({ mensaje: 'Solicitud rechazada.' });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function estadisticas(req, res) {
  try {
    const { rows } = await query('SELECT estado,COUNT(*) AS total FROM solicitudes_entrenador GROUP BY estado');
    return res.json({ stats: rows });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listarSolicitudes, aprobar, rechazar, estadisticas };
