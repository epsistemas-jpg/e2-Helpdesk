import { TicketStatusBadge } from "./TicketStatusBadge.js";
import { TicketPriorityBadge } from "./TicketPriorityBadge.js";
import { ResolutionEstimate } from "./ResolutionEstimate.js";

export function TicketInfo(ticket) {

    const categoryLabels = {
        hardware: "Hardware", software: "Software", red_internet: "Red / Internet",
        correo: "Correo", impresora: "Impresora", acceso_permisos: "Accesos / Permisos", otro: "Otro"
    };
    const category = categoryLabels[ticket.category] || ticket.category || "Otro";
    const slaMinutes = Number(ticket.sla_minutes) || Number(ticket.sla_hours || 0) * 60;
    const slaLabel = slaMinutes ? (slaMinutes < 60 ? `${slaMinutes} minutos` : `${Math.ceil(slaMinutes / 60)} horas`) : "Pendiente";

    return `

    <div class="ticket-card">

        <div class="ticket-card-header">

            <div>

                <span class="ticket-card-kicker"><i class="bi bi-ticket-perforated"></i> Solicitud de soporte · #${ticket.id}</span>

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

            <div class="ticket-section-heading"><span class="ticket-section-icon"><i class="bi bi-chat-square-text"></i></span><h4>Descripción del incidente</h4></div>

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

    <span>Responsable</span>
    <strong class="${ticket.assigned_name ? "" : "not-assigned"}">${ticket.assigned_name || "Sin asignar"}</strong>

</div>

            <div>

                <span>Oficina</span>

                <strong>${ticket.office}</strong>

            </div>

            <div>

                <span>Categoría</span>

                <strong>${category}</strong>

            </div>

            <div class="ticket-data-highlight">
                <span>SLA de atención</span>
                <strong>${slaLabel}${ticket.sla_due_at ? ` · vence ${new Date(ticket.sla_due_at).toLocaleString()}` : ""}</strong>
            </div>

            <div class="ticket-data-highlight ticket-resolution-estimate">
                <span>Tiempo estimado de solución</span>
                ${ResolutionEstimate({ ticket })}
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
