import { TicketFilters } from "../../components/tickets/TicketFilters.js";
import { TicketTable } from "../../components/tickets/TicketTable.js";
import { getTickets } from "../../services/ticketService.js";

export async function TicketsPage(filters = {}) {

    const response = await getTickets(filters);

    const safeUserName = String(filters.user_name || "usuario")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const historyHeader = filters.user_id
        ? `
            <div class="history-context">
                <div>
                    <i class="bi bi-person-lines-fill"></i>
                    <div>
                        <strong>Historial de ${safeUserName}</strong>
                        <span>Consulta todos los tickets registrados por esta persona.</span>
                    </div>
                </div>
                <a class="history-clear" href="/pages/tickets/tickets.html">Ver todos los tickets</a>
            </div>
        `
        : "";

    return `

        ${historyHeader}
        ${TicketFilters()}

        ${TicketTable(response.tickets)}

    `;

}
