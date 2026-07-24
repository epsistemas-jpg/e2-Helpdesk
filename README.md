# Sistema de Tickets de Soporte TI

Plataforma interna para que cualquier persona de la oficina reporte un problema técnico
en el momento, y que los administradores del área de TI reciban una notificación
automática por correo apenas se crea el ticket.

Incluye campo de **código AnyDesk**, que aparece solo cuando la persona marca que está
fuera de la oficina (la sede principal es "América 2").

## Estructura del proyecto

```
helpdesk/
├── backend/          Node.js + Express + MySQL + JWT + Nodemailer
│   └── database/schema.sql   ← Importa este archivo en MySQL Workbench
└── frontend/          HTML + CSS + JavaScript ES Modules + Vite
```

## Roles del sistema

| Rol       | Puede...                                                              |
|-----------|-------------------------------------------------------------------------|
| employee  | Crear tickets y ver solo los suyos                                     |
| support   | Ver todos los tickets, asignarse, cambiar estado                       |
| admin     | Igual que support + recibe notificación de todo ticket nuevo           |

Los roles `support` y `admin` **no se crean desde el registro** (por seguridad). Se
asignan directamente en la base de datos. El script `schema.sql` ya crea 2 admins de
ejemplo.

---

## 1. Base de datos (MySQL Workbench)

1. Abre **MySQL Workbench** y conéctate a tu servidor local.
2. Abre el archivo `backend/database/schema.sql` (File → Open SQL Script).
3. Dale al rayo amarillo **Execute** (ejecuta todo el script). Esto crea:
   - La base de datos `helpdesk`
   - Las tablas `users`, `tickets`, `ticket_events`
   - 2 usuarios administradores y 1 empleado de prueba

**Usuarios de prueba** (contraseña para los 3: `Soporte123`):
- `admin1@empresa.com` (admin)
- `admin2@empresa.com` (admin)
- `empleado@empresa.com` (empleado)

⚠️ Cambia esas contraseñas apenas puedas — son solo para probar el sistema.

---

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con:
- Tus credenciales de MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)
- Un `JWT_SECRET` largo y aleatorio
- Tus credenciales SMTP para el envío de correos (ver sección de correo abajo)

```bash
npm run dev
```

El backend queda corriendo en `http://localhost:4000`.

### Configurar el envío de correos (Nodemailer)

Si usas Gmail:
1. Activa la verificación en 2 pasos en la cuenta de correo que va a enviar notificaciones.
2. Genera una "Contraseña de aplicación" en https://myaccount.google.com/apppasswords
3. Usa esa contraseña (no la del correo) en `SMTP_PASSWORD`.

Si prefieres otro proveedor (Outlook/Office365, SendGrid, un SMTP corporativo), solo
cambia `SMTP_HOST`, `SMTP_PORT` y las credenciales en el `.env`.

Los correos se envían automáticamente a **todos los usuarios con rol `admin`** cada
vez que:
- Se crea un ticket nuevo (a los admins)
- Cambia el estado de un ticket (a la persona que lo reportó)

---

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Se abre en `http://localhost:5173`. La URL del backend se configura en `frontend/.env`
mediante `VITE_API_URL` (por defecto: `https://e2-helpdesk.onrender.com/api`).

---

## 4. Flujo de uso

1. Un empleado se registra o inicia sesión.
2. Llena el formulario: título, descripción, categoría, prioridad, sede.
3. Si marca "Estoy fuera de la oficina", debe ingresar el código de **AnyDesk**
   (campo obligatorio en ese caso).
4. Al enviar, se crea el ticket y se manda un correo automático a los administradores TI.
5. El administrador/soporte entra al **Panel de tickets**, ve todo ordenado por
   prioridad, se asigna el ticket, cambia el estado y deja notas.
6. El empleado ve el avance desde "Mis tickets" y recibe un correo cuando cambia el estado.

---

## 5. Despliegue

El backend está listo para desplegarse en cualquier servicio Node (Railway, Render,
un VPS, etc). Ten en cuenta que **Render no ofrece MySQL administrado** (solo
PostgreSQL) — si vas a usar Render para el backend, la base de datos MySQL puede ir en:
- Un servicio externo tipo **Railway**, **PlanetScale** o **Aiven** (tienen plan gratis)
- Tu propio servidor/VPS con MySQL instalado

En cualquier caso, solo necesitas exponer las variables `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME` apuntando a esa base de datos remota — el código no
cambia.

Para el frontend: `npm run build` genera la carpeta `dist/`, lista para subir a
Netlify, Vercel, o cualquier hosting estático (o el mismo backend puede servirla).

---

## Próximos pasos sugeridos (para ir agregando)

- Logos y colores corporativos: todo el estilo vive en
  `frontend/src/styles/global.css`, en las variables `:root` al inicio del archivo.
  Solo cambia esos valores y se actualiza toda la app.
- Adjuntar capturas de pantalla al crear un ticket.
- Notificaciones también por Slack/Teams además de correo.
- Reportes/exportar a Excel de tickets por período.
