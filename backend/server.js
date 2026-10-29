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
// Los adjuntos no se publican como carpeta estática: cada descarga pasa por
// autenticación y autorización en la ruta de tickets.
const ticketLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api/tickets', ticketLimiter, ticketRoutes);
app.use(express.json({ limit: '1mb' }));

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const isProduction = process.env.NODE_ENV === 'production'
  || process.env.HOSTINGER === 'true'
  || Boolean(process.env.PORT);
const serveFrontend = (process.env.SERVE_FRONTEND === 'true' || isProduction)
  && fs.existsSync(frontendDist);
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
    await pool.query('SELECT 1');
    await pool.query('ALTER TABLE tickets ADD COLUMN IF NOT EXISTS sla_minutes INTEGER NULL');
    console.log('Conectado a PostgreSQL/Neon');
  } catch (err) {
    console.error('Error conectando a PostgreSQL/Neon:', err.message);
  }
})();

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en el puerto ${PORT}`));
