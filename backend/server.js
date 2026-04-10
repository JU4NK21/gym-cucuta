require('dotenv').config({ path: __dirname + '/.env' });
const express         = require('express');
const cors            = require('cors');
const path            = require('path');
const fs              = require('fs');
const { inicializar } = require('./db/database');

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Frontend */
const frontendCandidates = [
  path.join(__dirname, '..', 'frontend'),
  path.join(process.cwd(), 'frontend'),
];
let frontendPath = frontendCandidates.find(p => fs.existsSync(path.join(p, 'index.html')));
if (frontendPath) {
  app.use(express.static(frontendPath));
  console.log('✅ Frontend en:', frontendPath);
}

/* Rutas API */
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/validacion',require('./routes/validacion'));
app.use('/api/usuarios',  require('./routes/usuarios'));
app.use('/api/miembros',  require('./routes/miembros'));
app.get('/api/health',    (req, res) => res.json({ status: 'ok' }));

/* SPA fallback */
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'No encontrado.' });
  if (frontendPath) return res.sendFile(path.join(frontendPath, 'index.html'));
  res.status(404).send('Frontend no disponible');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3000;

// 1. Iniciamos el servidor de inmediato
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🏋️  Gym Cúcuta encendido en puerto ${PORT}`);
    
    // 2. Intentamos conectar a la DB una vez que el servidor ya está arriba
    inicializar()
        .then(() => console.log("✅ Proceso de tablas completado"))
        .catch(err => console.error("❌ Falló la inicialización de DB:", err.message));
});