const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true // Solo pon esto, la variable de entorno del Paso 1 hará el resto
});


const query = (text, params) => pool.query(text, params);

module.exports = { query };


async function inicializar() {
  await query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id                  SERIAL PRIMARY KEY,
      nombre              TEXT NOT NULL,
      apellido            TEXT NOT NULL,
      email               TEXT NOT NULL UNIQUE,
      password_hash       TEXT NOT NULL,
      rol                 TEXT NOT NULL CHECK(rol IN ('admin','entrenador','cliente')),
      estado              TEXT NOT NULL DEFAULT 'activo' CHECK(estado IN ('activo','pendiente','rechazado')),
      telefono            TEXT,
      fecha_registro      DATE NOT NULL DEFAULT CURRENT_DATE,
      fecha_actualizacion TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS solicitudes_entrenador (
      id              SERIAL PRIMARY KEY,
      usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      estado          TEXT NOT NULL DEFAULT 'pendiente' CHECK(estado IN ('pendiente','aprobado','rechazado')),
      motivo_rechazo  TEXT,
      revisado_por    INTEGER REFERENCES usuarios(id),
      fecha_solicitud TIMESTAMP NOT NULL DEFAULT NOW(),
      fecha_revision  TIMESTAMP
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS sesiones_log (
      id         SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
      accion     TEXT NOT NULL,
      fecha      TIMESTAMP NOT NULL DEFAULT NOW(),
      ip         TEXT
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS miembros_gym (
      id             SERIAL PRIMARY KEY,
      nombres        TEXT NOT NULL,
      apellidos      TEXT NOT NULL,
      cedula         TEXT NOT NULL UNIQUE,
      telefono       TEXT,
      email          TEXT,
      plan           TEXT,
      vence          TEXT,
      estado         TEXT NOT NULL DEFAULT 'Activo',
      notas          TEXT,
      fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `);

  const { rows } = await query('SELECT id FROM usuarios WHERE email = $1', ['admin@gymcucuta.com']);
  if (rows.length === 0) {
    const hash = await bcrypt.hash('Admin1234!', 12);
    await query(
      `INSERT INTO usuarios (nombre,apellido,email,password_hash,rol,estado) VALUES ($1,$2,$3,$4,'admin','activo')`,
      ['Administrador', 'Principal', 'admin@gymcucuta.com', hash]
    );
    console.log('✅ Admin creado: admin@gymcucuta.com / Admin1234!');
  }
  console.log('✅ Base de datos PostgreSQL lista');
}

module.exports = { query, inicializar };
