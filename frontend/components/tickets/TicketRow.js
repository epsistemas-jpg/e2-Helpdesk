import { TicketStatusBadge } from "./TicketStatusBadge.js";
import { TicketPriorityBadge } from "./TicketPriorityBadge.js";

export function TicketRow(ticket) {

    return `

        <tr>

            <td>#${ticket.id}</td>

            <td>${ticket.title}</td>

            <td>${ticket.category}</td>

            <td>${TicketPriorityBadge(ticket.priority)}</td>

            <td>${TicketStatusBadge(ticket.status)}</td>

            <td>
                ${ticket.assigned_name
            ? `
                            <span class="assigned-user">
                                <i class="bi bi-person-fill"></i>
                                ${ticket.assigned_name}
                            </span>
                        `
            : `
                            <span class="assigned-empty">
                                <i class="bi bi-person-dash-fill"></i>
                                Sin asignar
                            </span>
                        `
        }
            </td>

            <td>${ticket.reporter_name}</td>

            <td>${new Date(ticket.created_at).toLocaleDateString()}</td>

            <td>

                <button
                    class="view-ticket"
                    data-id="${ticket.id}">

                    <i class="bi bi-eye"></i>

                    Ver

                </button>

            </td>
            

        </tr>
        <tr
    data-id="${ticket.id}"
    data-title="${ticket.title.toLowerCase()}"
    data-category="${ticket.category.toLowerCase()}"
    data-priority="${ticket.priority}"
    data-status="${ticket.status}"
    data-reporter="${ticket.reporter_name.toLowerCase()}"
    data-assigned="${(ticket.assigned_name || "").toLowerCase()}"
>

    `;

}