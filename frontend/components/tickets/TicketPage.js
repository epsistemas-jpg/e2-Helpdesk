import { TicketsTable } from "./TicketTable.js";
import { getTickets } from "../../services/ticketService.js";

export async function TicketsPage(){

    const tickets = await getTickets();

    return `

<h2>

Todos los Tickets

</h2>

<br>

${TicketsTable(tickets)}

`;

}