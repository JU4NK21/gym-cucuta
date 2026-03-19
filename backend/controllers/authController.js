/* ═══════════════════════════════════════
   CONTROLLERS/AUTH — Registro y Login (sqlite3 async)
═══════════════════════════════════════ */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { db } = require('../db/database');

async function registro(req, res) {
  try {
    const { nombre, apellido, email, password, telefono, rol } = req.body;
    if (!nombre || !apellido || !email || !password || !rol)
      return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
    if (!['cliente', 'entrenador'].includes(rol))
      return res.status(400).json({ error: 'Rol inválido.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Formato de correo inválido.' });

    const existe = await db.get_('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
    if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });

    const password_hash = await bcrypt.hash(password, 12);
    const estado = rol === 'cliente' ? 'activo' : 'pendiente';

    const result = await db.run_(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, estado, telefono) VALUES (?,?,?,?,?,?,?)',
      [nombre.trim(), apellido.trim(), email.toLowerCase().trim(), password_hash, rol, estado, telefono || null]
    );
    const nuevoId = result.lastID;

    if (rol === 'entrenador') {
      await db.run_('INSERT INTO solicitudes_entrenador (usuario_id) VALUES (?)', [nuevoId]);
      return res.status(201).json({ mensaje: 'Registro exitoso. Cuenta pendiente de aprobación.', estado: 'pendiente', rol });
    }

    const token = jwt.sign({ id: nuevoId, nombre, apellido, email: email.toLowerCase(), rol, estado }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    return res.status(201).json({ mensaje: '¡Registro exitoso! Bienvenido.', token, usuario: { id: nuevoId, nombre, apellido, email: email.toLowerCase(), rol, estado } });
  } catch (err) {
    console.error('Error registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos.' });

    const u = await db.get_('SELECT * FROM usuarios WHERE email = ?', [email.toLowerCase().trim()]);
    if (!u) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas.' });

    if (u.estado === 'pendiente')  return res.status(403).json({ error: 'Cuenta pendiente de aprobación.', estado: 'pendiente' });
    if (u.estado === 'rechazado')  return res.status(403).json({ error: 'Solicitud rechazada. Contacta al administrador.', estado: 'rechazado' });

    const token = jwt.sign({ id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol, estado: u.estado }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    await db.run_('INSERT INTO sesiones_log (usuario_id, accion, ip) VALUES (?,?,?)', [u.id, 'login', req.ip]);

    return res.json({ mensaje: `Bienvenido, ${u.nombre}`, token, usuario: { id: u.id, nombre: u.nombre, apellido: u.apellido, email: u.email, rol: u.rol, estado: u.estado } });
  } catch (err) {
    console.error('Error login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

async function perfil(req, res) {
  try {
    const u = await db.get_('SELECT id, nombre, apellido, email, rol, estado, telefono, fecha_registro FROM usuarios WHERE id = ?', [req.usuario.id]);
    if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
    return res.json({ usuario: u });
  } catch (err) { return res.status(500).json({ error: 'Error interno.' }); }
}

module.exports = { registro, login, perfil };
