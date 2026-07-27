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

Variables obligatorias: `JWT_SECRET`, `CORS_ORIGIN`, `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD` y `DB_NAME`. Las variables SMTP y Telegram son opcionales
para notificaciones.

`CORS_ORIGIN` debe ser el dominio de Vercel, por ejemplo:

```text
https://tu-proyecto.vercel.app
```

## TiDB

Ejecuta `backend/database/001_schema.sql` una vez en MySQL Workbench conectado a
TiDB. Hazlo sobre una base de datos nueva o verifica antes si las tablas ya existen.
