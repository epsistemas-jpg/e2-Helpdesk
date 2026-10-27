export function TicketPriorityBadge(priority) {

    const labels = { urgente: "Urgente", alta: "Alta", media: "Media", baja: "Baja" };

    return `

        <span class="badge priority-badge priority-${priority || "media"}">

            ${labels[priority] || String(priority || "Media")}

        </span>

    `;

}
