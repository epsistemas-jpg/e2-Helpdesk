export function TicketStatusBadge(status) {

    const colors = {

        abierto: "warning",

        en_progreso: "info",

        resuelto: "success",

        cerrado: "secondary"

    };

    return `

        <span class="badge ${colors[status]}">

            ${status.replace("_"," ")}

        </span>

    `;

}