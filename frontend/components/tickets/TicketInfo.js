import { TicketStatusBadge } from "./TicketStatusBadge.js";
import { TicketPriorityBadge } from "./TicketPriorityBadge.js";

export function TicketInfo(ticket) {

    return `

    <div class="ticket-card">

        <div class="ticket-card-header">

            <div>

                <h2>

                    Ticket #${ticket.id}

                </h2>

                <h3>

                    ${ticket.title}

                </h3>

            </div>

            <div class="ticket-badges">

                ${TicketStatusBadge(ticket.status)}

                ${TicketPriorityBadge(ticket.priority)}

            </div>

        </div>

        <div class="ticket-description">

            <h4>Descripción</h4>

            <p>

                ${ticket.description}

            </p>

        </div>

        <div class="ticket-grid">

            <div>

                <span>Solicitante</span>

                <strong>${ticket.reporter_name}</strong>

            </div>
            <div>

    <span>Asignado a</span>

    <div>

    <span>Asignado a</span>

    <strong class="${ticket.assigned_name
            ? ""
            : "not-assigned"
        }">

        ${ticket.assigned_name
            ? ticket.assigned_name
            : "Sin asignar"
        }

    </strong>

</div>

</div>

            <div>

                <span>Oficina</span>

                <strong>${ticket.office}</strong>

            </div>

            <div>

                <span>Categoría</span>

                <strong>${ticket.category}</strong>

            </div>

            <div>

                <span>Asignado a</span>

                <strong>

                    ${ticket.assigned_name || "Sin asignar"}

                </strong>

            </div>

            <div>

                <span>Creado</span>

                <strong>

                    ${new Date(ticket.created_at).toLocaleString()}

                </strong>

            </div>

        </div>

    </div>

    `;
}