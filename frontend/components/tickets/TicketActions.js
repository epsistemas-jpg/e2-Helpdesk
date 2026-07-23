import { Storage } from "../../utils/storage.js";

export function TicketActions(ticket) {

    const user = Storage.getUser() || {};

    const isSupport =
        user.role === "support" ||
        user.role === "admin";

    const blocked =
        ticket.status === "resuelto" ||
        ticket.status === "cerrado";

    return `

        <div class="ticket-actions">

            <h3>Acciones</h3>

            ${isSupport
            ? `
                    <button
    id="assignTicket"
    data-assigned="${ticket.assigned_to || ""}"
    ${blocked ? "disabled" : ""}
>
    ${ticket.assigned_name ? "Reasignar técnico" : "Asignar técnico"}
</button>

                    <button id="changeStatus" ${blocked ? "disabled" : ""}>
                        Cambiar estado
                    </button>
                    `
            : ""
        }

            <button id="commentTicket" ${blocked ? "disabled" : ""}>
                Agregar comentario
            </button>

            <button id="uploadFile" ${blocked ? "disabled" : ""}>
                Adjuntar archivo
            </button>

            ${isSupport && ticket.status !== "cerrado"
            ? `
                    <button id="closeTicket"
                            class="danger"
                            ${blocked ? "disabled" : ""}>
                        Cerrar ticket
                    </button>
                    `
            : ""
        }

            ${blocked
            ? `
                    <div class="ticket-locked">
                        <i class="bi bi-lock-fill"></i>
                        <span>Este ticket ya fue finalizado.</span>
                    </div>
                    `
            : ""
        }

        </div>

    `;
}