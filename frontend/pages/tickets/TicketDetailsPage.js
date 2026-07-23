import { getTicket } from "../../services/ticketService.js";
import { TicketInfo } from "../../components/tickets/TicketInfo.js";
import { TicketActions } from "../../components/tickets/TicketActions.js";
import { TicketTimeline } from "../../components/tickets/TicketTimeline.js";

export async function TicketDetailsPage(id) {

    const data = await getTicket(id);

    return `

        <div class="ticket-details-container">

            <div class="ticket-left">

                ${TicketInfo(data.ticket)}

                <br>

                ${TicketTimeline(data.events, data.files)}

            </div>

            <div class="ticket-right">

                ${TicketActions(data.ticket)}

            </div>

        </div>

    `;

}
