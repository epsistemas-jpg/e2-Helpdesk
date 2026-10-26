const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth.routes');
const ticketRoutes = require('./src/routes/ticket.routes');
const userRoutes = require('./src/routes/user.routes');
const googleChatRoutes = require('./src/routes/google-chat.routes');
const assistantRoutes = require('./src/routes/assistant.routes');

const app = express();
app.disable('x-powered-by');
app.use(helmet());
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
const assistantLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false });
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

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const serveFrontend = process.env.SERVE_FRONTEND === 'true' && fs.existsSync(frontendDist);
if (serveFrontend) app.use(express.static(frontendDist));

app.get('/', (req, res) => {
  if (serveFrontend) return res.sendFile(path.join(frontendDist, 'index.html'));
  if (process.env.FRONTEND_URL) {
    return res.redirect(process.env.FRONTEND_URL);
  }
  res.json({ ok: true, service: 'helpdesk-backend', message: 'Backend activo. Usa /api/health para comprobar el estado.' });
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'helpdesk-backend' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/google-chat', googleChatRoutes);
app.use('/api/assistant', assistantLimiter, assistantRoutes);

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
