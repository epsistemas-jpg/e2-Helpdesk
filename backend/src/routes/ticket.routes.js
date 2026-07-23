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

router.patch(
    "/:id/assign",
    requireRole("support", "admin"),
    assignTicket
);
// ======================================================
// Todas las rutas requieren autenticación
// ======================================================

router.use(requireAuth);


// ======================================================
// EMPLEADOS / SOPORTE / ADMIN
// ======================================================

// Crear ticket
router.post("/", createTicket);


// Dashboard estadísticas
router.get(
    "/stats",
    stats
);


// Listar tickets
router.get("/", listTickets);


// Ver un ticket
router.get("/:id", getTicket);


// ======================================================
// SOPORTE Y ADMIN
// ======================================================


// Cambiar estado
router.patch(
    "/:id/status",
    requireRole("support", "admin"),
    updateTicketStatus
);

router.post('/:id/comments', addComment);
router.post('/:id/files', addAttachment);


// Tomar ticket
router.patch(
    "/:id/take",
    requireRole("support","admin"),
    takeTicket
);


module.exports = router;
