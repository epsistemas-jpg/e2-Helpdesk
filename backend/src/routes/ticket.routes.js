const express = require("express");
const router = express.Router();

const {
    createTicket,
    listTickets,
    getTicket,
    getTicketAttachment,
    updateTicketStatus,
    addComment,
    addAttachment,
    takeTicket,
    assignTicket,
    stats,
    report,
    ticketRanking,
    suggestProblems
} = require("../controllers/ticketController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

// ======================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ======================================================
router.use(requireAuth);

// El endpoint de adjuntos necesita más capacidad por el contenido base64,
// pero sigue pasando primero por autenticación y por el límite de tickets.
router.post("/:id/files", express.json({ limit: "15mb" }), addAttachment);
router.use(express.json({ limit: "1mb" }));

// ======================================================
// EMPLEADOS / SOPORTE / ADMIN
// ======================================================

// Crear ticket
router.post("/", createTicket);

// Sugerencias no persistentes para ayudar a redactar el ticket.
router.post("/suggestions", suggestProblems);

// Dashboard estadísticas
router.get("/stats", stats);

// Reporte consolidado por rango de fechas.
router.get("/report", requireRole("support", "admin"), report);

// Ranking de tickets creados, exclusivo para administradores.
router.get("/ranking", requireRole("admin"), ticketRanking);

// Listar tickets
router.get("/", listTickets);

// Descarga protegida: el usuario solo puede ver archivos de tickets autorizados.
router.get("/:id/files/:fileId", getTicketAttachment);

// Ver un ticket
router.get("/:id", getTicket);

// Agregar comentario
router.post("/:id/comments", addComment);

// ======================================================
// SOPORTE Y ADMIN
// ======================================================

// Asignar ticket a un técnico
router.patch(
    "/:id/assign",
    requireRole("support", "admin"),
    assignTicket
);

// Tomar ticket
router.patch(
    "/:id/take",
    requireRole("support", "admin"),
    takeTicket
);

// Cambiar estado
router.patch(
    "/:id/status",
    requireRole("support", "admin"),
    updateTicketStatus
);

module.exports = router;
