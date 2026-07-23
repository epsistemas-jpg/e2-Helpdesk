export function TicketTimeline(events = [], files = []) {

    const attachments = files.length ? `
        <div class="ticket-attachments">
            <h4>Archivos adjuntos</h4>
            ${files.map(file => `<p><a href="http://localhost:4000${file.storage_path}" target="_blank" rel="noopener">📎 ${file.original_name}</a> <small>(${Math.ceil(file.file_size / 1024)} KB)</small></p>`).join("")}
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

                    <strong>${event.user_name}</strong>

                    <span>${event.status || ""}</span>

                    <p>${event.note || "Sin comentario"}</p>

                    <small>${new Date(event.created_at).toLocaleString()}</small>

                </div>

            `).join("")}
            ${attachments}

        </div>

    `;

}
