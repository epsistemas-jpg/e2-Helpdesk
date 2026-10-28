export function TicketPriorityBadge(priority) {

    const labels = { urgente: "Urgente", alta: "Alta", media: "Media", baja: "Baja" };
    const colorClass = priority === "urgente" ? "urgent" : (priority || "media");

    return `

        <span class="badge priority-badge priority-${colorClass}">

            ${labels[priority] || String(priority || "Media")}

        </span>

    `;

}
