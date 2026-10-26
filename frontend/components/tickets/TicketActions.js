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
    <button class="ticket-action-button ticket-action-primary"
    id="assignTicket"
    data-assigned="${ticket.assigned_to || ""}"
    ${blocked ? "disabled" : ""}
>
    <i class="bi bi-person-check"></i><span>${ticket.assigned_name ? "Reasignar técnico" : "Asignar técnico"}</span><i class="bi bi-arrow-right action-arrow"></i>
</button>

                    <button id="changeStatus" class="ticket-action-button" ${blocked ? "disabled" : ""}>
                        <i class="bi bi-arrow-repeat"></i><span>Cambiar estado</span><i class="bi bi-chevron-right action-arrow"></i>
                    </button>
                    `
            : ""
        }

            <button id="commentTicket" class="ticket-action-button" ${blocked ? "disabled" : ""}>
                <i class="bi bi-chat-left-text"></i><span>Agregar comentario</span><i class="bi bi-chevron-right action-arrow"></i>
            </button>

            <button id="uploadFile" class="ticket-action-button" ${blocked ? "disabled" : ""}>
                <i class="bi bi-paperclip"></i><span>Adjuntar archivo</span><i class="bi bi-chevron-right action-arrow"></i>
            </button>

            ${isSupport && ticket.status !== "cerrado"
            ? `
                    <button id="closeTicket"
                            class="ticket-action-button danger"
                            ${blocked ? "disabled" : ""}>
                        <i class="bi bi-check2-circle"></i><span>Cerrar ticket</span><i class="bi bi-chevron-right action-arrow"></i>
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
