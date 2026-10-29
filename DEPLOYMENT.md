# Despliegue

## Vercel

El proyecto raíz ya incluye `vercel.json`. Vercel ejecutará:

```text
npm --prefix frontend ci
npm --prefix frontend run build
```

La salida es `frontend/dist`. Configura la variable `VITE_API_URL` con la URL del
backend, incluyendo `/api`, por ejemplo:

```text
https://helpdesk-backend.onrender.com/api
```

## Render

El backend está en `backend/` y tiene su propio `render.yaml`. Si el servicio se
crea desde el dashboard, usa `backend` como Root Directory, `npm ci` como Build
Command y `npm start` como Start Command.

Variables obligatorias: `JWT_SECRET`, `CORS_ORIGIN` y `DATABASE_URL` (la cadena de
conexión PostgreSQL de Neon). `DATABASE_SSL=true` debe estar activo en producción.
Las variables SMTP y Telegram son opcionales
para notificaciones.

`CORS_ORIGIN` debe ser el dominio de Vercel, por ejemplo:

```text
https://tu-proyecto.vercel.app
```

## TiDB

Ejecuta `backend/database/001_schema.sql` una vez en MySQL Workbench conectado a
TiDB. Hazlo sobre una base de datos nueva o verifica antes si las tablas ya existen.
## Variables por entorno

### Local

Backend (`backend/.env`):

```env
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
FRONTEND_URL=http://localhost:5173
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/google/callback
```

Frontend (`frontend/.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

### Producción

Para Hostinger puedes desplegar todo como una sola aplicación Node.js. Usa estos comandos en la configuración de la aplicación:

```text
Build command: npm run build
Start command: npm run hostinger:start
```

Configura `SERVE_FRONTEND=true`. El backend servirá el contenido generado en `frontend/dist` y también las rutas `/api`. El arranque detecta automáticamente el `PORT` asignado por Hostinger.

En Render configura `CORS_ORIGIN` y `FRONTEND_URL` con la URL real de Vercel. Configura también `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `GOOGLE_REDIRECT_URI` con la URL pública del backend:

```env
CORS_ORIGIN=https://tu-frontend.vercel.app
FRONTEND_URL=https://tu-frontend.vercel.app
GOOGLE_REDIRECT_URI=https://tu-backend.onrender.com/api/auth/google/callback
```

En Vercel configura `VITE_API_URL` como:

```env
VITE_API_URL=/api
```

Para este modo de Hostinger, usa:

```env
SERVE_FRONTEND=true
CORS_ORIGIN=https://tu-dominio.com
FRONTEND_URL=https://tu-dominio.com
GOOGLE_REDIRECT_URI=https://tu-dominio.com/api/auth/google/callback
```

No subas ningún archivo `.env` al repositorio. Usa `.env.example` como plantilla.
