export function TicketTimeline(events = [], files = [], ticketId = "") {

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const isImage = file => String(file.mime_type || '').startsWith('image/')
        || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(String(file.original_name || ''));
    const formatSize = file => {
        const bytes = Number(file.file_size) || 0;
        return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
    };
    const attachments = files.length ? `
        <div class="ticket-attachments">
            <h4>Archivos adjuntos</h4>
            <div class="ticket-attachment-grid">
                ${files.map(file => isImage(file)
                    ? `<figure class="ticket-attachment-image" data-inline-image data-ticket-id="${escapeHtml(ticketId)}" data-file-id="${escapeHtml(file.id)}">
                        <div class="ticket-attachment-image-frame"><img alt="${escapeHtml(file.original_name)}" loading="lazy"><span class="ticket-attachment-loading"><i class="bi bi-arrow-repeat"></i></span></div>
                        <figcaption><strong>${escapeHtml(file.original_name)}</strong><small>${formatSize(file)}</small></figcaption>
                    </figure>`
                    : `<p><a href="#" class="ticket-file-link" data-ticket-id="${escapeHtml(ticketId)}" data-file-id="${escapeHtml(file.id)}">📎 ${escapeHtml(file.original_name)}</a> <small>(${formatSize(file)})</small></p>`
                ).join("")}
            </div>
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
