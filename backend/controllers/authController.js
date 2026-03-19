const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { db } = require('../db/database');

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

    const existe = db.prepare('SELECT id FROM usuarios WHERE email=?').get(email.toLowerCase());
    if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

    const hash   = await bcrypt.hash(password, 12);
    const estado = rol === 'cliente' ? 'activo' : 'pendiente';
    const r = db.prepare('INSERT INTO usuarios (nombre,apellido,email,password_hash,rol,estado,telefono) VALUES (?,?,?,?,?,?,?)')
      .run(nombre.trim(), apellido.trim(), email.toLowerCase().trim(), hash, rol, estado, telefono||null);

    if (rol === 'entrenador') {
      db.prepare('INSERT INTO solicitudes_entrenador (usuario_id) VALUES (?)').run(r.lastInsertRowid);
      return res.status(201).json({ mensaje: 'Registro exitoso. Cuenta pendiente de aprobación por un administrador.', estado: 'pendiente', rol });
    }

    const u = { id: r.lastInsertRowid, nombre, apellido, email: email.toLowerCase(), rol, estado };
    return res.status(201).json({ mensaje: '¡Registro exitoso! Bienvenido.', token: token(u), usuario: u });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email||!password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });

    const u = db.prepare('SELECT * FROM usuarios WHERE email=?').get(email.toLowerCase().trim());
    if (!u) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    if (u.estado === 'pendiente') return res.status(403).json({ error: 'Cuenta pendiente de aprobación.', estado: 'pendiente' });
    if (u.estado === 'rechazado') return res.status(403).json({ error: 'Solicitud rechazada. Contacta al administrador.', estado: 'rechazado' });

    const payload = { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol, estado: u.estado };
    db.prepare('INSERT INTO sesiones_log (usuario_id,accion,ip) VALUES (?,?,?)').run(u.id,'login',req.ip);

    return res.json({ mensaje: `Bienvenido, ${u.nombre}`, token: token(payload), usuario: payload });
  } catch(err) { console.error(err); return res.status(500).json({ error: 'Error interno del servidor.' }); }
}

async function perfil(req, res) {
  try {
    const u = db.prepare('SELECT id,nombre,apellido,email,rol,estado,telefono,fecha_registro FROM usuarios WHERE id=?').get(req.usuario.id);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ usuario: u });
  } catch(err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { registro, login, perfil };
