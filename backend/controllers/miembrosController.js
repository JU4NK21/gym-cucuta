const { query } = require('../db/database');

async function listar(req, res) {
  try {
    const { rows } = await query('SELECT * FROM miembros_gym ORDER BY fecha_registro DESC');
    return res.json({ miembros: rows });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function crear(req, res) {
  try {
    const { nombres, apellidos, cedula, telefono, email, plan, vence, estado, notas } = req.body;
    if (!nombres || !apellidos || !cedula)
      return res.status(400).json({ error: 'Nombres, apellidos y cédula son obligatorios.' });

    const existe = await query('SELECT id FROM miembros_gym WHERE cedula=$1', [cedula]);
    if (existe.rows.length > 0) return res.status(409).json({ error: 'Ya existe un miembro con esa cédula.' });

    const r = await query(
      `INSERT INTO miembros_gym (nombres,apellidos,cedula,telefono,email,plan,vence,estado,notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nombres, apellidos, cedula, telefono||'', email||'', plan||'', vence||'', estado||'Activo', notas||'']
    );
    return res.status(201).json({ mensaje: 'Miembro registrado.', miembro: r.rows[0] });
  } catch(e) { console.error(e); return res.status(500).json({ error: 'Error interno.' }); }
}

async function actualizar(req, res) {
  try {
    const { nombres, apellidos, telefono, email, plan, vence, estado, notas } = req.body;
    const existe = await query('SELECT id FROM miembros_gym WHERE id=$1', [req.params.id]);
    if (!existe.rows[0]) return res.status(404).json({ error: 'Miembro no encontrado.' });

    const r = await query(
      `UPDATE miembros_gym SET
        nombres=COALESCE($1,nombres), apellidos=COALESCE($2,apellidos),
        telefono=COALESCE($3,telefono), email=COALESCE($4,email),
        plan=COALESCE($5,plan), vence=COALESCE($6,vence),
        estado=COALESCE($7,estado), notas=COALESCE($8,notas)
       WHERE id=$9 RETURNING *`,
      [nombres||null, apellidos||null, telefono||null, email||null,
       plan||null, vence||null, estado||null, notas||null, req.params.id]
    );
    return res.json({ mensaje: 'Miembro actualizado.', miembro: r.rows[0] });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function eliminar(req, res) {
  try {
    const existe = await query('SELECT id FROM miembros_gym WHERE id=$1', [req.params.id]);
    if (!existe.rows[0]) return res.status(404).json({ error: 'Miembro no encontrado.' });
    await query('DELETE FROM miembros_gym WHERE id=$1', [req.params.id]);
    return res.json({ mensaje: 'Miembro eliminado.' });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

async function estadisticas(req, res) {
  try {
    const total   = await query('SELECT COUNT(*) AS total FROM miembros_gym');
    const activos = await query("SELECT COUNT(*) AS total FROM miembros_gym WHERE estado='Activo'");
    const planes  = await query('SELECT plan, COUNT(*) AS total FROM miembros_gym GROUP BY plan');
    const hoy     = new Date().toISOString().split('T')[0];
    const nuevosHoy = await query('SELECT COUNT(*) AS total FROM miembros_gym WHERE fecha_registro=$1', [hoy]);

    return res.json({
      total:     parseInt(total.rows[0].total),
      activos:   parseInt(activos.rows[0].total),
      inactivos: parseInt(total.rows[0].total) - parseInt(activos.rows[0].total),
      nuevosHoy: parseInt(nuevosHoy.rows[0].total),
      planes:    planes.rows
    });
  } catch(e) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { listar, crear, actualizar, eliminar, estadisticas };
