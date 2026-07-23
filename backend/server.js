const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const ticketRoutes = require('./src/routes/ticket.routes');
const userRoutes = require('./src/routes/user.routes');
const { enviarNuevoTicket } = require('./src/services/telegramService');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'helpdesk-backend' }));

//CODIGO TEMPORAL PARA PROBAR LA CONEXION CON TELEGRAM
app.get('/api/test-telegram', async (req, res) => {
    try {

        await enviarNuevoTicket(
            {
                id: 999,
                title: "Prueba del sistema",
                description: "Si estás leyendo esto, Telegram quedó conectado correctamente.",
                category: "hardware",
                priority: "media",
                office: "América 2",
                is_remote: false
            },
            {
                name: "Sebastián Perez",
                email: "epsistemas@e2energiaeficiente.com"
            }
        );

        res.json({
            ok: true,
            message: "Mensaje enviado a Telegram."
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend corriendo en el puerto ${PORT}`));
