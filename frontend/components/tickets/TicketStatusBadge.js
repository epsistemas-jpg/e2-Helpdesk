export function TicketStatusBadge(status) {

    const labels = {
        abierto: "Abierto",
        en_progreso: "En progreso",
        resuelto: "Resuelto",
        cerrado: "Cerrado"
    };

    return `

        <span class="badge status-badge status-${status || "desconocido"}">

            ${labels[status] || String(status || "Sin estado").replace("_", " ")}

        </span>

    `;

}
