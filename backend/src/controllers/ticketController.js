const pool = require('../config/db');
const fs = require('fs/promises');
const path = require('path');
const { sendMail, ticketCreatedEmail, statusUpdatedEmail } = require('../utils/mailer');
const { enviarNuevoTicket } = require('../services/telegramService');
const CATEGORIES = ['hardware', 'software', 'red_internet', 'correo', 'impresora', 'acceso_permisos', 'otro'];
const PRIORITIES = ['baja', 'media', 'alta', 'urgente'];
const STATUSES = ['abierto', 'en_progreso', 'resuelto', 'cerrado'];

// Crea un ticket. Si el empleado marca que está fuera de la oficina,
// el código de AnyDesk se vuelve obligatorio.
async function createTicket(req, res) {
  try {
    const { title, description, category, priority, office, is_remote, anydesk_code } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'El título y la descripción son obligatorios.' });
    }
    const remote = !!is_remote;
    if (remote && (!anydesk_code || !anydesk_code.trim())) {
      return res.status(400).json({ error: 'Si estás fuera de la oficina, el código de AnyDesk es obligatorio.' });
    }

    const finalCategory = CATEGORIES.includes(category) ? category : 'otro';
    const finalPriority = PRIORITIES.includes(priority) ? priority : 'media';

    const [result] = await pool.query(
      `INSERT INTO tickets (user_id, title, description, category, priority, office, is_remote, anydesk_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        description,
        finalCategory,
        finalPriority,
        office || req.user.office || 'América 2',
        remote ? 1 : 0,
        remote ? anydesk_code.trim() : null,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    const ticket = rows[0];

    // Notificar a todos los administradores TI


    // Notificación por correo

    const [admins] = await pool.query(
      "SELECT email FROM users WHERE role = 'admin' AND active = 1"
    );

    if (admins.length > 0) {
      const toList = admins.map((a) => a.email).join(',');

      await sendMail({
        to: toList,
        subject: `🎫 Nuevo ticket #${ticket.id} - ${ticket.title} [${finalPriority.toUpperCase()}]`,
        html: ticketCreatedEmail(ticket, req.user),
      });
    }

    // ===============================
    // Notificación por Telegram
    // ===============================
    // ===============================
// Notificación por Telegram
// ===============================
try {

    console.log("===== ENVIANDO TELEGRAM =====");

    await enviarNuevoTicket(ticket, req.user);

    console.log("===== TELEGRAM ENVIADO =====");

} catch (err) {

    console.error("===== ERROR TELEGRAM =====");
    console.error(err);

}

res.status(201).json({ ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando el ticket.' });
  }
}

// Empleados ven solo sus tickets. Soporte/admin ven todos, con filtros opcionales.
async function listTickets(req, res) {
  try {
    const { status, priority, office, mine } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role === 'employee' || mine === 'true') {
      conditions.push('t.user_id = ?');
      params.push(req.user.id);
    }
    if (status && STATUSES.includes(status)) {
      conditions.push('t.status = ?');
      params.push(status);
    }
    if (priority && PRIORITIES.includes(priority)) {
      conditions.push('t.priority = ?');
      params.push(priority);
    }
    if (office) {
      conditions.push('t.office = ?');
      params.push(office);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT t.*, u.name AS reporter_name, u.email AS reporter_email,
              a.name AS assigned_name
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN users a ON a.id = t.assigned_to
       ${where}
       ORDER BY FIELD(t.priority, 'urgente','alta','media','baja'), t.created_at DESC`,
      params
    );
    res.json({ tickets: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error listando los tickets.' });
  }
}

async function getTicket(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT t.*, u.name AS reporter_name, u.email AS reporter_email, a.name AS assigned_name
       FROM tickets t
       JOIN users u ON u.id = t.user_id
       LEFT JOIN users a ON a.id = t.assigned_to
       WHERE t.id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado.' });

    const ticket = rows[0];
    if (req.user.role === 'employee' && ticket.user_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este ticket.' });
    }

    const [events] = await pool.query(
      `SELECT e.*, u.name AS user_name FROM ticket_events e
       LEFT JOIN users u ON u.id = e.user_id
       WHERE e.ticket_id = ? ORDER BY e.created_at ASC`,
      [id]
    );

    const [files] = await pool.query(
      `SELECT f.*, u.name AS uploaded_by_name
       FROM ticket_files f LEFT JOIN users u ON u.id = f.uploaded_by
       WHERE f.ticket_id = ? ORDER BY f.created_at ASC`,
      [id]
    );

    res.json({ ticket, events, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo el ticket.' });
  }
}

// Solo soporte/admin pueden cambiar estado o asignarse el ticket
async function updateTicketStatus(req, res) {
  try {

    const { id } = req.params;
    const { status, note } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        error: "Estado inválido."
      });
    }

    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Ticket no encontrado."
      });
    }

    const ticket = rows[0];
    const oldStatus = ticket.status;

    // No permitir modificar tickets cerrados
    if (oldStatus === "resuelto" || oldStatus === "cerrado") {
      return res.status(400).json({
        error: "Este ticket ya fue finalizado y no puede modificarse."
      });
    }

    const timestampField =
      status === "cerrado"
        ? ", closed_at = NOW()"
        : status === "resuelto"
          ? ", resolved_at = NOW()"
          : "";

    await pool.query(
      `UPDATE tickets
             SET status = ? ${timestampField}
             WHERE id = ?`,
      [status, id]
    );

    await pool.query(
      `INSERT INTO ticket_events
            (
                ticket_id,
                user_id,
                event_type,
                old_value,
                new_value,
                note
            )
            VALUES (?, ?, 'status_changed', ?, ?, ?)`,
      [
        id,
        req.user.id,
        oldStatus,
        status,
        note || `Estado cambiado a ${status}`
      ]
    );

    const [updatedRows] = await pool.query(
      `SELECT
                t.*,
                u.email AS reporter_email,
                u.name AS reporter_name
             FROM tickets t
             JOIN users u
               ON u.id = t.user_id
             WHERE t.id = ?`,
      [id]
    );

    const updatedTicket = updatedRows[0];

    try {
      await sendMail({
        to: updatedTicket.reporter_email,
        subject: `Actualización de tu ticket #${updatedTicket.id}`,
        html: statusUpdatedEmail(updatedTicket),
      });
    } catch (mailError) {
      console.error(
        "No se pudo enviar el correo de actualización:",
        mailError
      );
    }

    return res.json({
      ticket: updatedTicket
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Error actualizando el ticket."
    });

  }
}

async function addComment(req, res) {

  try {

    const { id } = req.params;

    const note =
      typeof req.body.note === "string"
        ? req.body.note.trim()
        : "";

    if (!note) {
      return res.status(400).json({
        error: "El comentario no puede estar vacío."
      });
    }

    const [ticket] = await pool.query(
      "SELECT id, status FROM tickets WHERE id = ?",
      [id]
    );

    if (!ticket.length) {
      return res.status(404).json({
        error: "Ticket no encontrado."
      });
    }

    // No permitir comentarios en tickets finalizados
if (
    ticket[0].status === "resuelto" ||
    ticket[0].status === "cerrado"
) {
    return res.status(400).json({
        error: "Este ticket ya fue finalizado y no admite nuevos comentarios."
    });
}

    await pool.query(
      `INSERT INTO ticket_events
            (
                ticket_id,
                user_id,
                event_type,
                note
            )
            VALUES (?, ?, 'comment', ?)`,
      [
        id,
        req.user.id,
        note
      ]
    );

    return res.status(201).json({
      message: "Comentario agregado."
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: "Error agregando el comentario."
    });

  }

}
async function addAttachment(req, res) {
    try {

        const { id } = req.params;
        const { file_name, mime_type, file_size, data } = req.body;

        if (!file_name || !data) {
            return res.status(400).json({
                error: "Debes seleccionar un archivo."
            });
        }

        const [ticket] = await pool.query(
            "SELECT id, status FROM tickets WHERE id = ?",
            [id]
        );

        if (!ticket.length) {
            return res.status(404).json({
                error: "Ticket no encontrado."
            });
        }

        // ===========================
        // NO permitir archivos si ya fue finalizado
        // ===========================
        if (
            ticket[0].status === "resuelto" ||
            ticket[0].status === "cerrado"
        ) {
            return res.status(400).json({
                error: "Este ticket ya fue finalizado y no admite nuevos archivos."
            });
        }

        const base64 = String(data).replace(
            /^data:[^;]+;base64,/,
            ""
        );

        const buffer = Buffer.from(base64, "base64");

        if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
            return res.status(400).json({
                error: "El archivo debe pesar entre 1 byte y 10 MB."
            });
        }

        const safeName = path
            .basename(String(file_name))
            .replace(/[^a-zA-Z0-9._-]/g, "_");

        const storedName = `${Date.now()}-${req.user.id}-${safeName}`;

        const uploadDir = path.join(__dirname, "../../uploads");

        await fs.mkdir(uploadDir, {
            recursive: true
        });

        await fs.writeFile(
            path.join(uploadDir, storedName),
            buffer
        );

        await pool.query(
            `INSERT INTO ticket_files
            (
                ticket_id,
                uploaded_by,
                file_name,
                original_name,
                mime_type,
                file_size,
                storage_path
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                req.user.id,
                storedName,
                file_name,
                mime_type || "application/octet-stream",
                file_size || buffer.length,
                `/uploads/${storedName}`
            ]
        );

        await pool.query(
            `INSERT INTO ticket_events
            (
                ticket_id,
                user_id,
                event_type,
                note
            )
            VALUES (?, ?, 'attachment', ?)`,
            [
                id,
                req.user.id,
                `Archivo adjunto: ${file_name}`
            ]
        );

        return res.status(201).json({
            message: "Archivo adjuntado."
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: "Error adjuntando el archivo."
        });

    }
}
async function stats(req, res) {

  try {

    const condition = req.user.role === 'employee' ? 'WHERE user_id = ?' : '';
    const params = req.user.role === 'employee' ? [req.user.id] : [];
    const [rows] = await pool.query(`
            SELECT
                COUNT(*) AS total,

                COALESCE(SUM(status = 'abierto'), 0) AS open,
                COALESCE(SUM(status = 'en_progreso'), 0) AS progress,
                COALESCE(SUM(status = 'resuelto'), 0) AS resolved,
                COALESCE(SUM(status = 'cerrado'), 0) AS closed,

                COALESCE(SUM(priority = 'urgente'), 0) AS urgent,
                COALESCE(SUM(priority = 'alta'), 0) AS high,
                COALESCE(SUM(priority = 'media'), 0) AS medium,
                COALESCE(SUM(priority = 'baja'), 0) AS low

            FROM tickets ${condition}
        `, params);

    res.json(rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error obteniendo estadísticas."
    });

  }

}
async function takeTicket(req, res) {

  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM tickets WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Ticket no encontrado."
      });
    }

    const ticket = rows[0];

    // ===========================
    // VALIDAR SI YA FUE FINALIZADO
    // ===========================

    if (ticket.status === "resuelto" || ticket.status === "cerrado") {
      return res.status(400).json({
        error: "Este ticket ya fue finalizado y no puede modificarse."
      });
    }

    // ===========================

    if (ticket.assigned_to) {
      return res.status(400).json({
        error: "El ticket ya está asignado."
      });
    }

    await pool.query(
      `UPDATE tickets
             SET assigned_to = ?,
                 status='en_progreso'
             WHERE id=?`,
      [req.user.id, id]
    );

    await pool.query(
      `INSERT INTO ticket_events
            (
                ticket_id,
                user_id,
                event_type,
                old_value,
                new_value,
                note
            )
            VALUES (?,?,?,?,?,?)`,
      [
        id,
        req.user.id,
        "assigned",
        ticket.status,
        "en_progreso",
        "Tomó el ticket"
      ]
    );

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Error tomando ticket."
    });

  }

}
async function assignTicket(req, res) {

    try {

        const { id } = req.params;
        const { assigned_to } = req.body;

        if (!assigned_to) {
            return res.status(400).json({
                error: "Debe seleccionar un técnico."
            });
        }

        // Buscar el ticket
        const [tickets] = await pool.query(
            "SELECT * FROM tickets WHERE id = ?",
            [id]
        );

        if (!tickets.length) {
            return res.status(404).json({
                error: "Ticket no encontrado."
            });
        }

        const ticket = tickets[0];

        // No permitir modificar tickets finalizados
        if (
            ticket.status === "resuelto" ||
            ticket.status === "cerrado"
        ) {
            return res.status(400).json({
                error: "Este ticket ya fue finalizado."
            });
        }

        // Verificar que exista el técnico
        const [users] = await pool.query(
            `SELECT id, name
             FROM users
             WHERE id = ?
             AND role IN ('support','admin')
             AND active = 1`,
            [assigned_to]
        );

        if (!users.length) {
            return res.status(404).json({
                error: "El técnico seleccionado no existe."
            });
        }

        const technician = users[0];

        // Determinar si es una asignación o una reasignación
const action = ticket.assigned_to
    ? "Reasignó el ticket a"
    : "Asignó el ticket a";

// Si el ticket estaba abierto pasa automáticamente a En Progreso.
// Si ya estaba En Progreso conserva ese estado.
const newStatus =
    ticket.status === "abierto"
        ? "en_progreso"
        : ticket.status;

// Actualizar ticket
await pool.query(
    `UPDATE tickets
     SET assigned_to = ?,
         status = ?
     WHERE id = ?`,
    [
        assigned_to,
        newStatus,
        id
    ]
);

// Registrar evento
await pool.query(
    `INSERT INTO ticket_events
    (
        ticket_id,
        user_id,
        event_type,
        old_value,
        new_value,
        note
    )
    VALUES (?,?,?,?,?,?)`,
    [
        id,
        req.user.id,
        "assigned",
        ticket.assigned_to || "",
        assigned_to,
        `${action} ${technician.name}`
    ]
);

        return res.json({
            success: true,
            technician
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: "Error asignando el ticket."
        });

    }

}
async function legacyUpdateTicketStatus(req, res) {

  try {

    const { id } = req.params;
    const { status } = req.body;


    const [rows] = await pool.query(

      "SELECT * FROM tickets WHERE id = ?",

      [id]

    );


    if (!rows.length) {

      return res.status(404).json({

        error: "Ticket no encontrado."

      });

    }


    const estadosValidos = [

      "abierto",
      "en_progreso",
      "resuelto",
      "cerrado"

    ];


    if (!estadosValidos.includes(status)) {

      return res.status(400).json({

        error: "Estado no válido."

      });

    }


    await pool.query(

      `UPDATE tickets
             SET status = ?
             WHERE id = ?`,

      [

        status,
        id

      ]

    );


    await pool.query(
      `INSERT INTO ticket_events
    (
        ticket_id,
        user_id,
        event_type,
        old_value,
        new_value,
        note
    )
    VALUES (?,?,?,?,?,?)`,
      [
        id,
        req.user.id,
        "status_change",
        rows[0].status,
        status,
        note || `Estado cambiado a ${status}`
      ]
    );

  }

  catch (err) {

    console.error(err);

    res.status(500).json({

      error: "Error actualizando estado del ticket."

    });

  }

}

module.exports = { createTicket, listTickets, getTicket, updateTicketStatus, addComment, addAttachment, stats, takeTicket, assignTicket, CATEGORIES, PRIORITIES, STATUSES };

