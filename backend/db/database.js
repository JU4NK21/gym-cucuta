/* ═══════════════════════════════════════
   DATABASE.JS — sqlite3 (compatible Windows sin Visual Studio)
═══════════════════════════════════════ */
const sqlite3 = require('sqlite3').verbose();
const path    = require('path');
const bcrypt  = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'gymcucuta.db');

const db = new sqlite3.Database(DB_PATH, err => {
  if (err) { console.error('Error abriendo BD:', err.message); process.exit(1); }
  console.log('✅ Base de datos conectada');
});

/* ── Helpers de promesas ── */
db.run_  = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function(err) { if (err) rej(err); else res(this); }));
db.get_  = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (err, row)  => { if (err) rej(err); else res(row); }));
db.all_  = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (err, rows) => { if (err) rej(err); else res(rows); }));

/* ── Inicializar tablas y admin por defecto ── */
async function inicializar() {
  await db.run_('PRAGMA foreign_keys = ON');
  await db.run_('PRAGMA journal_mode = WAL');

  await db.run_(`CREATE TABLE IF NOT EXISTS usuarios (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre              TEXT NOT NULL,
    apellido            TEXT NOT NULL,
    email               TEXT NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    rol                 TEXT NOT NULL CHECK(rol IN ('admin','entrenador','cliente')),
    estado              TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo','pendiente','rechazado')),
    telefono            TEXT,
    fecha_registro      TEXT NOT NULL DEFAULT (date('now')),
    fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await db.run_(`CREATE TABLE IF NOT EXISTS solicitudes_entrenador (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estado          TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','aprobado','rechazado')),
    motivo_rechazo  TEXT,
    revisado_por    INTEGER REFERENCES usuarios(id),
    fecha_solicitud TEXT NOT NULL DEFAULT (datetime('now')),
    fecha_revision  TEXT
  )`);

  await db.run_(`CREATE TABLE IF NOT EXISTS sesiones_log (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    accion     TEXT NOT NULL,
    fecha      TEXT NOT NULL DEFAULT (datetime('now')),
    ip         TEXT
  )`);

  // Crear admin por defecto
  const admin = await db.get_('SELECT id FROM usuarios WHERE email = ?', ['admin@gymcucuta.com']);
  if (!admin) {
    const hash = await bcrypt.hash('Admin1234!', 12);
    await db.run_(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, estado) VALUES (?,?,?,?,'admin','activo')`,
      ['Administrador', 'Principal', 'admin@gymcucuta.com', hash]
    );
    console.log('✅ Admin creado: admin@gymcucuta.com / Admin1234!');
  }
  console.log('✅ Base de datos lista');
}

module.exports = { db, inicializar };
