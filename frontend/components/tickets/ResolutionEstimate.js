const PRIORITY_RANGES = {
    urgente: [2, 4],
    alta: [4, 8],
    media: [8, 24],
    baja: [24, 48]
};

const CATEGORY_ADJUSTMENTS = {
    hardware: [0, 4],
    impresora: [0, 4],
    red_internet: [2, 8],
    correo: [2, 8],
    software: [4, 12],
    acceso_permisos: [2, 12],
    otro: [0, 8]
};

function formatDuration(hours) {
    if (hours < 8) return `${hours} horas`;
    if (hours < 24) return `${Math.ceil(hours / 4) * 4} horas`;
    return `${Math.round(hours / 24)} día${hours >= 48 ? "s" : ""}`;
}

export function getResolutionEstimate(ticket = {}) {
    if (ticket.estimated_resolution_label) return ticket.estimated_resolution_label;
    const [priorityMin, priorityMax] = PRIORITY_RANGES[ticket.priority] || PRIORITY_RANGES.media;
    const [categoryMin, categoryMax] = CATEGORY_ADJUSTMENTS[ticket.category] || CATEGORY_ADJUSTMENTS.otro;
    const min = priorityMin + categoryMin;
    const max = priorityMax + categoryMax;
    return `${formatDuration(min)} a ${formatDuration(max)}`;
}

export function ResolutionEstimate({ ticket, compact = false } = {}) {
    const estimate = getResolutionEstimate(ticket);
    return `<span class="resolution-estimate${compact ? " resolution-estimate-compact" : ""}" title="Estimación inicial de tiempo de solución"><i class="bi bi-clock-history"></i><span>${compact ? estimate : `Tiempo estimado: ${estimate}`}</span></span>`;
}
