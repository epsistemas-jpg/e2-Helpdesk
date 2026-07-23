const express = require("express");
const router = express.Router();

const {
    createTicket,
    listTickets,
    getTicket,
    updateTicketStatus,
    addComment,
    addAttachment,
    takeTicket,
    assignTicket,
    stats
} = require("../controllers/ticketController");

const {
    requireAuth,
    requireRole
} = require("../middleware/auth");

// ======================================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ======================================================
router.use(requireAuth);

// ======================================================
// EMPLEADOS / SOPORTE / ADMIN
// ======================================================

// Crear ticket
router.post("/", createTicket);

// Dashboard estadísticas
router.get("/stats", stats);

// Listar tickets
router.get("/", listTickets);

// Ver un ticket
router.get("/:id", getTicket);

// Agregar comentario
router.post("/:id/comments", addComment);

// Adjuntar archivo
router.post("/:id/files", addAttachment);

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