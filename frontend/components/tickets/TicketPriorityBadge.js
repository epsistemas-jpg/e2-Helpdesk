export function TicketPriorityBadge(priority) {

    const colors = {

        urgente: "danger",

        alta: "warning",

        media: "primary",

        baja: "secondary"

    };

    return `

        <span class="badge priority-badge ${colors[priority] || "secondary"}">

            ${priority}

        </span>

    `;

}
