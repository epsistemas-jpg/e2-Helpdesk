export function TicketPriorityBadge(priority) {

    const colors = {

        urgente: "danger",

        alta: "warning",

        media: "primary",

        baja: "secondary"

    };

    return `

        <span class="badge ${colors[priority]}">

            ${priority}

        </span>

    `;

}