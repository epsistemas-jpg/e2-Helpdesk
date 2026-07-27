const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const ticketRoutes = require('./src/routes/ticket.routes');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: false
}));
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'helpdesk-backend' }));
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Conectado a TiDB');
    conn.release();
  } catch (err) {
    console.error('Error conectando a TiDB:', err.message);
  }
})();

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en el puerto ${PORT}`));
