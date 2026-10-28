const TITLE_ESTIMATES = [
    [/contrase[nñ]a|acceso|permiso|usuario bloqueado|desbloquear/, [0.5, 2], ["acceso_permisos"]],
    [/teclado|mouse|rat[oó]n|monitor|pantalla|micr[oó]fono|c[aá]mara/, [1, 3], ["hardware"]],
    [/impresora|imprimir|impresi[oó]n|t[oó]ner|tonner/, [1, 3], ["impresora"]],
    [/correo|outlook|email|e-mail/, [1, 3], ["correo"]],
    [/internet|wifi|wi-fi|red|vpn|conexi[oó]n|conectar/, [1, 4], ["red_internet"]],
    [/reuni[oó]n|teams|zoom|meet/, [0.5, 2], ["software", "otro"]],
    [/sap|power\s*bi|sharepoint|excel|word/, [2, 6], ["software"]],
    [/no abre|no inicia|error|falla|fall[oó]|no funciona|lento|bloquea/, [1, 4], ["*"]]
];

const CATEGORY_ESTIMATES = {
    hardware: [1, 3],
    impresora: [1, 3],
    red_internet: [1, 4],
    correo: [1, 3],
    software: [2, 6],
    acceso_permisos: [0.5, 2],
    otro: [1, 4]
};

function normalize(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function formatDuration(hours) {
    if (hours < 1) return `${Math.round(hours * 60)} minutos`;
    if (hours < 2 && hours % 1) return "1 hora y 30 minutos";
    if (hours < 8) return `${hours} hora${hours === 1 ? "" : "s"}`;
    if (hours < 24) return `${Math.round(hours)} horas`;
    return `${Math.round(hours / 24)} día${hours >= 48 ? "s" : ""}`;
}

export function getResolutionEstimate(ticket = {}) {
    if (ticket.estimated_resolution_label) return ticket.estimated_resolution_label;
    const title = normalize(ticket.title);
    const category = ticket.category || "otro";
    const categoryRange = CATEGORY_ESTIMATES[category] || CATEGORY_ESTIMATES.otro;
    const titleMatch = TITLE_ESTIMATES.find(([pattern, , categories]) =>
        pattern.test(title) && (categories.includes("*") || categories.includes(category))
    );
    const [baseMin, baseMax] = titleMatch?.[1] || categoryRange;
    const priority = ticket.priority || "media";
    const multiplier = {
        urgente: [0.5, 0.75],
        alta: [0.75, 1],
        media: [1, 1],
        baja: [1.5, 2]
    }[priority] || [1, 1];
    const min = Math.max(0.5, Math.round(baseMin * multiplier[0] * 2) / 2);
    const max = Math.max(min, Math.round(baseMax * multiplier[1] * 2) / 2);
    return `${formatDuration(min)} a ${formatDuration(max)}`;
}

export function ResolutionEstimate({ ticket, compact = false } = {}) {
    const estimate = getResolutionEstimate(ticket);
    return `<span class="resolution-estimate${compact ? " resolution-estimate-compact" : ""}" title="Estimación inicial de tiempo de solución"><span class="resolution-estimate-label">Tiempo estimado:</span><span>${estimate}</span></span>`;
}
