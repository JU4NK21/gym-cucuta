const { query } = require('../db/database');

async function listar(req,res) {
  try {
    const { rows } = await query('SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios ORDER BY fecha_registro DESC');
    return res.json({ usuarios: rows });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}

async function obtener(req,res) {
  try {
    const { rows } = await query('SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error:'No encontrado.' });
    return res.json({ usuario: rows[0] });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}

async function actualizar(req,res) {
  try {
    const { nombre,apellido,telefono,estado } = req.body;
    const existe = await query('SELECT id FROM usuarios WHERE id=$1', [req.params.id]);
    if (!existe.rows[0]) return res.status(404).json({ error:'No encontrado.' });

    const { rows } = await query(
      `UPDATE usuarios SET nombre=COALESCE($1,nombre),apellido=COALESCE($2,apellido),
       telefono=COALESCE($3,telefono),estado=COALESCE($4,estado),fecha_actualizacion=NOW()
       WHERE id=$5 RETURNING id,nombre,apellido,email,rol,estado`,
      [nombre||null, apellido||null, telefono||null, estado||null, req.params.id]
    );
    return res.json({ mensaje:'Actualizado.', usuario: rows[0] });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}

async function eliminar(req,res) {
  try {
    const { rows } = await query('SELECT rol FROM usuarios WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error:'No encontrado.' });
    if (rows[0].rol==='admin' && parseInt(req.params.id)===req.usuario.id)
      return res.status(400).json({ error:'No puedes eliminarte a ti mismo.' });
    await query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
    return res.json({ mensaje:'Eliminado.' });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}

async function estadisticas(req,res) {
  try {
    const totales = await query('SELECT rol,estado,COUNT(*) AS total FROM usuarios GROUP BY rol,estado');
    const total   = await query('SELECT COUNT(*) AS total FROM usuarios');
    return res.json({ totales: totales.rows, totalUsuarios: parseInt(total.rows[0].total) });
  } catch(e) { return res.status(500).json({ error:'Error interno.' }); }
}

module.exports = { listar, obtener, actualizar, eliminar, estadisticas };
