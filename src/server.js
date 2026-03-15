// ─── Cargar variables de entorno ────────────────────
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// ─── Rutas ─────────────────────────────────────────
const statusRoutes = require('./routes/status');
const preguntasRoutes = require('./routes/preguntas');
const authRoutes = require('./routes/auth');
const questionRoutes = require('./routes/questions');
const questionTypeRoutes = require('./routes/questionTypes');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const aiRoutes = require('./routes/aiRoutes');

// ─── Configuración de la app ───────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ───────────────────────────────────
app.use(cors());               // Permite peticiones desde cualquier origen (Flutter)
app.use(express.json());       // Parsea body JSON en peticiones POST/PUT

// ─── Registro de rutas ────────────────────────────
app.use('/api/status', statusRoutes);
app.use('/api/preguntas', preguntasRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/question-types', questionTypeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);

// ─── Ruta raíz ────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ mensaje: 'API de Trivia - usa /api/status o /api/preguntas' });
});

// ─── Manejo de rutas no encontradas ───────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Sincronizar BD y arrancar servidor ───────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('📦 Conectado a PostgreSQL');

    await sequelize.sync({ alter: true });
    console.log('🗄️  Tablas sincronizadas correctamente');

    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

start();

module.exports = app;
