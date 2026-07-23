import { TicketFilters } from "../../components/tickets/TicketFilters.js";
import { TicketTable } from "../../components/tickets/TicketTable.js";
import { getTickets } from "../../services/ticketService.js";

export async function TicketsPage() {

    const response = await getTickets();

    return `

        ${TicketFilters()}

        ${TicketTable(response.tickets)}

    `;

}