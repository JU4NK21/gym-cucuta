/* ═══════════════════════════════════════
   DATABASE.JS — better-sqlite3 (para Railway/Linux)
═══════════════════════════════════════ */
const Database = require('better-sqlite3');
const path     = require('path');
const bcrypt   = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'gymcucuta.db');
const db      = new Database(DB_PATH);

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
  `);

  const admin = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@gymcucuta.com');
  if (!admin) {
    const hash = bcrypt.hashSync('Admin1234!', 12);
    db.prepare(`INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, estado) VALUES (?,?,?,?,'admin','activo')`)
      .run('Administrador', 'Principal', 'admin@gymcucuta.com', hash);
    console.log('✅ Admin creado: admin@gymcucuta.com / Admin1234!');
  }
  console.log('✅ Base de datos lista');
}

// Helpers para mantener compatibilidad con código async existente
db.get_ = (sql, params = []) => Promise.resolve(db.prepare(sql).get(...params));
db.all_ = (sql, params = []) => Promise.resolve(db.prepare(sql).all(...params));
db.run_ = (sql, params = []) => Promise.resolve(db.prepare(sql).run(...params));

module.exports = { db, inicializar };
