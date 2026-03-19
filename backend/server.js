require('dotenv').config();
const express         = require('express');
const cors            = require('cors');
const path            = require('path');
const { inicializar } = require('./db/database');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ── Buscar frontend en múltiples rutas posibles ── */
const possiblePaths = [
  path.join(__dirname, '..', 'frontend'),   // local: backend/../frontend
  path.join(__dirname, 'frontend'),          // por si acaso
  path.join(process.cwd(), 'frontend'),      // desde raíz del proyecto
];

const fs = require('fs');
let frontendPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    frontendPath = p;
    break;
  }
}

if (frontendPath) {
  console.log('✅ Frontend encontrado en:', frontendPath);
  app.use(express.static(frontendPath));
} else {
  console.warn('⚠️  Frontend no encontrado. Solo API disponible.');
}

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/validacion', require('./routes/validacion'));
app.use('/api/usuarios',   require('./routes/usuarios'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Ruta no encontrada.' });
  if (frontendPath) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Frontend no encontrado.' });
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

inicializar().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏋️  Gym Cúcuta corriendo en http://localhost:${PORT}`);
    console.log(`🔑  Admin: admin@gymcucuta.com / Admin1234!\n`);
  });
}).catch(err => {
  console.error('Error iniciando BD:', err);
  process.exit(1);
});
