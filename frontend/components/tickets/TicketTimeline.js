export function TicketTimeline(events = [], files = [], ticketId = "") {

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const attachments = files.length ? `
        <div class="ticket-attachments">
            <h4>Archivos adjuntos</h4>
            ${files.map(file => `<p><a href="#" class="ticket-file-link" data-ticket-id="${escapeHtml(ticketId)}" data-file-id="${escapeHtml(file.id)}">📎 ${escapeHtml(file.original_name)}</a> <small>(${Math.ceil(Number(file.file_size) / 1024)} KB)</small></p>`).join("")}
        </div>` : "";

    if (!events.length) {

        return `

            <div class="ticket-history">

                <h3>Historial</h3>

                <p>${attachments ? "No hay eventos registrados." : "No hay eventos registrados."}</p>
                ${attachments}

            </div>

        `;

    }

    return `

        <div class="ticket-history">

            <h3>Historial</h3>

            ${events.map(event => `

                <div class="timeline-item">

                    <strong>${escapeHtml(event.user_name || "Usuario")}</strong>

                    <span>${event.status || ""}</span>

                    <p>${escapeHtml(event.note || "Sin comentario")}</p>

                    <small>${new Date(event.created_at).toLocaleString()}</small>

                </div>

            `).join("")}
            ${attachments}

        </div>

    `;

}
