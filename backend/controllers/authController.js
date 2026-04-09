const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { query } = require('../db/database');

function token(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

async function registro(req, res) {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;
    if (!nombre||!apellido||!email||!password||!rol)
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    if (!['cliente','entrenador'].includes(rol))
      return res.status(400).json({ error: 'Rol inválido.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Formato de correo inválido.' });

    const existe = await query('SELECT id FROM usuarios WHERE email=$1', [email.toLowerCase()]);
    if (existe.rows.length > 0) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

    const hash   = await bcrypt.hash(password, 12);
    const estado = rol === 'cliente' ? 'activo' : 'pendiente';
    const r = await query(
      'INSERT INTO usuarios (nombre,apellido,email,password_hash,rol,estado,telefono) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [nombre.trim(), apellido.trim(), email.toLowerCase().trim(), hash, rol, estado, telefono||null]
    );
    const newId = r.rows[0].id;

    if (rol === 'entrenador') {
      await query('INSERT INTO solicitudes_entrenador (usuario_id) VALUES ($1)', [newId]);
      return res.status(201).json({ mensaje: 'Registro exitoso. Cuenta pendiente de aprobación.', estado: 'pendiente', rol });
    }

    const u = { id: newId, nombre, apellido, email: email.toLowerCase(), rol, estado };
    return res.status(201).json({ mensaje: '¡Registro exitoso! Bienvenido.', token: token(u), usuario: u });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });

    const { rows } = await query('SELECT * FROM usuarios WHERE email=$1', [email.toLowerCase().trim()]);
    const u = rows[0];
    if (!u) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    if (u.estado === 'pendiente') return res.status(403).json({ error: 'Cuenta pendiente de aprobación.', estado: 'pendiente' });
    if (u.estado === 'rechazado') return res.status(403).json({ error: 'Solicitud rechazada. Contacta al administrador.', estado: 'rechazado' });

    const payload = { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol, estado: u.estado };
    await query('INSERT INTO sesiones_log (usuario_id,accion,ip) VALUES ($1,$2,$3)', [u.id, 'login', req.ip]);

    return res.json({ mensaje: `Bienvenido, ${u.nombre}`, token: token(payload), usuario: payload });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
}

async function perfil(req, res) {
  try {
    const { rows } = await query(
      'SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios WHERE id=$1',
      [req.usuario.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ usuario: rows[0] });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { registro, login, perfil };
