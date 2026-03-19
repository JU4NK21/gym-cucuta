require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const path           = require('path');
const { inicializar } = require('./db/database');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Servir frontend — funciona tanto local como en Railway */
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/validacion', require('./routes/validacion'));
app.use('/api/usuarios',   require('./routes/usuarios'));

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

/* Cualquier ruta que no sea /api → servir index.html del frontend */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
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
