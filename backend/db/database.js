const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const bcrypt   = require('bcryptjs');

/* ── Usar volumen persistente de Railway si existe,
      si no, usar carpeta local ── */
const DATA_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? process.env.RAILWAY_VOLUME_MOUNT_PATH
  : path.join(__dirname);

// Crear directorio si no existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'gymcucuta.db');
console.log('📁 Base de datos en:', DB_PATH);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

async function inicializar() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
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
    );
    CREATE TABLE IF NOT EXISTS solicitudes_entrenador (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado          TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','aprobado','rechazado')),
      motivo_rechazo  TEXT,
      revisado_por    INTEGER REFERENCES usuarios(id),
      fecha_solicitud TEXT NOT NULL DEFAULT (datetime('now')),
      fecha_revision  TEXT
    );
    CREATE TABLE IF NOT EXISTS sesiones_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      accion     TEXT NOT NULL,
      fecha      TEXT NOT NULL DEFAULT (datetime('now')),
      ip         TEXT
    );
    CREATE TABLE IF NOT EXISTS miembros_gym (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      nombres         TEXT NOT NULL,
      apellidos       TEXT NOT NULL,
      cedula          TEXT NOT NULL UNIQUE,
      telefono        TEXT,
      email           TEXT,
      plan            TEXT,
      vence           TEXT,
      estado          TEXT NOT NULL DEFAULT 'Activo',
      notas           TEXT,
      fecha_registro  TEXT NOT NULL DEFAULT (date('now'))
    );
  `);

  const admin = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@gymcucuta.com');
  if (!admin) {
    const hash = bcrypt.hashSync('Admin1234!', 12);
    db.prepare(`INSERT INTO usuarios (nombre,apellido,email,password_hash,rol,estado) VALUES (?,?,?,?,'admin','activo')`)
      .run('Administrador', 'Principal', 'admin@gymcucuta.com', hash);
    console.log('✅ Admin creado: admin@gymcucuta.com / Admin1234!');
  }
  console.log('✅ Base de datos lista');
}

db.get_ = (sql, p=[]) => Promise.resolve(db.prepare(sql).get(...p));
db.all_ = (sql, p=[]) => Promise.resolve(db.prepare(sql).all(...p));
db.run_ = (sql, p=[]) => Promise.resolve(db.prepare(sql).run(...p));

module.exports = { db, inicializar };
