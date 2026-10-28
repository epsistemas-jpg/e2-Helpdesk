import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { getReport } from "../../services/reportService.js";
import { Storage } from "../../utils/storage.js";
import { getResolutionEstimate } from "../../components/tickets/ResolutionEstimate.js";
if (requireAuth()) init();
async function init() {
    const user = Storage.getUser() || {};
    if (!["admin", "support"].includes(user.role)) return;

    try {
        const params = new URLSearchParams(window.location.search);
        const end = params.get("to") || toDate(new Date());
        const start = params.get("from") || toDate(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
        const report = await getReport(start, end);
        const { stats, tickets, administrators } = report;
        renderLayout({
            title: "Reportes",
            active: "reports",
            content: templateMarkup(report, user)
        });
        bindReportFilters();
        bindExports(report, user);
    } catch (error) {
        renderLayout({ title: "Reportes", active: "reports", content: `<div class="section"><h3>No fue posible cargar los reportes</h3><p>${escapeHtml(error.message)}</p></div>` });
    }
}

function templateMarkup(report, user) {
    const s = report.stats || {};
    const total = Number(s.total) || 0;
    const open = Number(s.open) || 0;
    const progress = Number(s.progress) || 0;
    const resolved = Number(s.resolved) || 0;
    const closed = Number(s.closed) || 0;
    const completed = resolved + closed;
    const pct = total ? Math.round(completed / total * 100) : 0;
    const width = value => total ? Math.min(100, Math.round(Number(value || 0) / total * 100)) : 0;
    const status = (value, label, cls) => `<div class="template-bar"><div class="template-bar-title"><span>${label}</span><b>${value}</b></div><div class="template-track"><span class="${cls}" style="width:${width(value)}%"></span></div></div>`;
    const adminRows = user.role === "admin" && report.administrators.length
        ? report.administrators.map((a, i) => `<tr><td>${i + 1}</td><td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.email)}</td><td>${a.resolved_count}</td><td>${a.assigned_count}</td></tr>`).join("")
        : `<tr><td colspan="5">No hay administradores con actividad en este periodo.</td></tr>`;
    const ticketRow = t => `<tr><td>${t.id}</td><td><strong>${escapeHtml(t.title)}</strong><small class="template-ticket-description">${escapeHtml(t.description || "Sin descripción")}</small></td><td>${escapeHtml(t.reporter_name || "-")}</td><td>${escapeHtml(t.status)}</td><td>${escapeHtml(t.priority)}</td><td>${escapeHtml(t.assigned_name || "Sin asignar")}</td><td>${new Date(t.created_at).toLocaleDateString()}</td></tr>`;
    const ticketsPerPage = 6;
    const ticketPages = [];
    for (let index = 0; index < report.tickets.length; index += ticketsPerPage) {
        ticketPages.push(report.tickets.slice(index, index + ticketsPerPage));
    }
    if (!ticketPages.length) ticketPages.push([]);
    const ticketPagesMarkup = ticketPages.map((pageTickets, pageIndex) => {
        const rows = pageTickets.length
            ? pageTickets.map(ticketRow).join("")
            : `<tr><td colspan="7">No hay tickets en el periodo seleccionado.</td></tr>`;
        return `<div class="template-ticket-page"><section class="template-card template-table-card template-ticket-table"><h2>Detalle de tickets del periodo <span class="template-period">${report.tickets.length} registros · Página ${pageIndex + 1} de ${ticketPages.length}</span></h2><p class="template-note">Listado completo de solicitudes, incluyendo la descripción registrada por cada usuario.</p><div class="tablewrap"><table><thead><tr><th>#</th><th>Ticket y descripción</th><th>Solicitante</th><th>Estado</th><th>Prioridad</th><th>Responsable</th><th>Creado</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`;
    }).join("");
    return `<div class="template-report">
      <header class="template-report-header"><h1>Resumen ejecutivo | <b>E2 ENERGÍA EFICIENTE</b></h1><div class="template-report-actions"><span>Periodo: ${report.from} - ${report.to}</span><label>Desde<input id="reportFrom" type="date" value="${report.from}"></label><label>Hasta<input id="reportTo" type="date" value="${report.to}"></label><button id="applyReport" class="btn-primary">Actualizar</button><button id="exportPdf" class="report-export">PDF</button><button id="exportExcel" class="report-export">Excel</button></div></header>
      <section class="template-card template-kpis"><div><small>Total de tickets</small><span>${total}</span></div><div><small>Abiertos</small><span>${open}</span></div><div><small>En progreso</small><span>${progress}</span></div><div><small>Resueltos / cerrados</small><span>${completed}</span></div></section>
      <div class="template-grid2"><section class="template-card"><h2>Porcentaje de resolución</h2><div class="template-donut-wrap"><div class="template-donut" style="--done:${pct}%"><div><strong>${pct}%</strong><span>resueltos</span></div></div><div class="template-legend"><p><i class="open"></i><span>Abiertos</span><b>${open}</b></p><p><i class="progress"></i><span>En progreso</span><b>${progress}</b></p><p><i class="done"></i><span>Resueltos / cerrados</span><b>${completed}</b></p></div></div></section><section class="template-card"><h2>Distribución por estado</h2>${status(open,"Abiertos","open")}${status(progress,"En progreso","progress")}${status(resolved,"Resueltos","resolved")}${status(closed,"Cerrados","closed")}</section></div>
      ${user.role === "admin" ? `<section class="template-card template-table-card"><h2>Tickets resueltos por administrador</h2><p class="template-note">Incluye tickets marcados como resueltos o cerrados en el periodo.</p><div class="tablewrap"><table><thead><tr><th>Puesto</th><th>Administrador</th><th>Correo</th><th>Resueltos / cerrados</th><th>Asignados</th></tr></thead><tbody>${adminRows}</tbody></table></div></section>` : ""}
    </div><div class="template-ticket-pages">${ticketPagesMarkup}</div>`;
}

function reportToolbar(from, to) {
    return `<section class="report-toolbar"><div class="report-heading"><span class="section-kicker">ANÁLISIS OPERATIVO</span><h2>Reporte de soporte</h2><p>Consulta el comportamiento de los tickets en un periodo.</p><div class="report-print-header"><div><strong>Resumen ejecutivo</strong><span>E2 ENERGÍA EFICIENTE · Mesa de ayuda</span><small>Periodo del informe: ${from} al ${to}</small></div><b>E2</b></div></div><div class="report-controls"><label>Desde<input id="reportFrom" type="date" value="${from}"></label><label>Hasta<input id="reportTo" type="date" value="${to}"></label><button id="applyReport" class="btn-primary"><i class="bi bi-arrow-clockwise"></i> Actualizar</button><button id="exportPdf" class="report-export"><i class="bi bi-file-earmark-pdf"></i> PDF</button><button id="exportExcel" class="report-export"><i class="bi bi-file-earmark-spreadsheet"></i> Excel</button></div></section>`;
}

function chartsMarkup(stats) {
    const total = Number(stats.total) || 0;
    const resolved = Number(stats.resolved) || 0;
    const closed = Number(stats.closed) || 0;
    const open = Number(stats.open) || 0;
    const progress = Number(stats.progress) || 0;
    const done = resolved + closed;
    const pct = total ? Math.round(done / total * 100) : 0;
    return `<section class="report-charts"><div class="report-chart-card"><div class="report-donut" style="--done:${pct}%"><strong>${pct}%</strong><span>resueltos</span></div><div class="report-legend"><span><i class="dot open"></i>Abiertos <b>${open}</b></span><span><i class="dot progress"></i>En progreso <b>${progress}</b></span><span><i class="dot done"></i>Resueltos / cerrados <b>${done}</b></span></div></div><div class="report-chart-card"><h3>Distribución por estado</h3><div class="bar-list">${bar("Abiertos", open, total, "open")}${bar("En progreso", progress, total, "progress")}${bar("Resueltos", resolved, total, "resolved")}${bar("Cerrados", closed, total, "closed")}</div></div></section>`;
}
function bar(label, value, total, color) { return `<div class="report-bar-row"><div><span>${label}</span><b>${value}</b></div><div class="report-bar"><i class="${color}" style="width:${total ? Math.max(value ? 4 : 0, Math.round(value / total * 100)) : 0}%"></i></div></div>`; }
function adminResolutionMarkup(rows = []) { return `<section class="section ranking-section"><div class="ranking-header"><div><span class="section-kicker">ADMINISTRACIÓN</span><h3>Tickets resueltos por administrador</h3><p>Incluye tickets marcados como resueltos o cerrados en el periodo.</p></div></div><div id="adminResolutionTable">${rankingRows(rows, true)}</div></section>`; }
function ticketsMarkup(tickets) { return `<section class="section report-tickets"><div class="ranking-header"><div><span class="section-kicker">DETALLE</span><h3>Tickets del periodo</h3></div><span class="report-count">${tickets.length} registros</span></div><div class="ranking-table-wrap"><table class="ticket-table"><thead><tr><th>#</th><th>Título</th><th>Solicitante</th><th>Estado</th><th>Prioridad</th><th>Responsable</th><th>Creado</th></tr></thead><tbody>${tickets.length ? tickets.map(t => `<tr><td>${t.id}</td><td>${escapeHtml(t.title)}</td><td>${escapeHtml(t.reporter_name || "-")}</td><td>${escapeHtml(t.status)}</td><td>${escapeHtml(t.priority)}</td><td>${escapeHtml(t.assigned_name || "Sin asignar")}</td><td>${new Date(t.created_at).toLocaleDateString()}</td></tr>`).join("") : `<tr><td colspan="7" class="empty-table">No hay tickets en este periodo.</td></tr>`}</tbody></table></div></section>`; }

function rankingMarkup(data) {
    return `<section class="section ranking-section"><div class="ranking-header"><div><span class="section-kicker">ADMINISTRACIÓN</span><h3>Ranking de tickets creados</h3><p>Compara quién registra más solicitudes en cada periodo.</p></div><select id="rankingPeriod" aria-label="Periodo del ranking"><option value="semanal">Semanal</option><option value="mensual" selected>Mensual</option><option value="anual">Anual</option></select></div><div id="rankingContent">${rankingRows(data?.ranking || [])}</div></section>`;
}

function rankingRows(ranking, resolvedOnly = false) {
    if (!ranking.length) return `<div class="ranking-empty"><i class="bi bi-bar-chart"></i><p>No hay tickets registrados en este periodo.</p></div>`;
    return `<div class="ranking-table-wrap"><table class="ticket-table ranking-table"><thead><tr><th>Puesto</th><th>Administrador</th><th>Correo</th><th>${resolvedOnly ? "Resueltos / cerrados" : "Tickets"}</th>${resolvedOnly ? "<th>Asignados</th>" : ""}</tr></thead><tbody>${ranking.map((item, index) => `<tr><td><span class="ranking-position position-${index + 1}">${index + 1}</span></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.email)}</td><td><strong>${Number(resolvedOnly ? item.resolved_count : item.ticket_count) || 0}</strong></td>${resolvedOnly ? `<td>${Number(item.assigned_count) || 0}</td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

function toDate(date) { return date.toISOString().slice(0, 10); }
function bindReportFilters() { document.querySelector("#applyReport")?.addEventListener("click", () => { const from = document.querySelector("#reportFrom")?.value; const to = document.querySelector("#reportTo")?.value; if (from && to) window.location.search = `?from=${from}&to=${to}`; }); }
function bindExports(report) { document.querySelector("#exportPdf")?.addEventListener("click", () => window.print()); document.querySelector("#exportExcel")?.addEventListener("click", () => exportExcel(report)); }

async function exportExcel(report) {
    if (!window.XLSX) {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const XLSX = window.XLSX;
    const stats = report.stats || {};
    const total = Number(stats.total) || 0;
    const resolved = Number(stats.resolved) || 0;
    const closed = Number(stats.closed) || 0;
    const completed = resolved + closed;
    const resolutionPercent = total ? `${Math.round((completed / total) * 100)}%` : "0%";
    const chartBar = value => total ? "█".repeat(Math.max(value ? 1 : 0, Math.round((value / total) * 20))) : "";
    const chartPercent = value => total ? `${Math.round((value / total) * 100)}%` : "0%";
    const statusLabel = { abierto: "Abierto", en_progreso: "En progreso", resuelto: "Resuelto", cerrado: "Cerrado" };
    const priorityLabel = { urgente: "Urgente", alta: "Alta", media: "Media", baja: "Baja" };
    const categoryLabel = { hardware: "Hardware", software: "Software", red_internet: "Red / Internet", correo: "Correo", impresora: "Impresora", acceso_permisos: "Accesos / Permisos", otro: "Otro" };
    const dateTime = value => value ? new Date(value).toLocaleString("es-CO") : "-";

    const summaryRows = [
        ["REPORTE DE SOPORTE", "E2 ENERGÍA EFICIENTE"],
        ["Periodo", `${report.from} al ${report.to}`],
        ["Generado", dateTime(new Date())],
        [],
        ["INDICADORES", "CANTIDAD"],
        ["Total de tickets", total],
        ["Abiertos", Number(stats.open) || 0],
        ["En progreso", Number(stats.progress) || 0],
        ["Resueltos", resolved],
        ["Cerrados", closed],
        ["Resueltos / cerrados", completed],
        ["Porcentaje de resolución", resolutionPercent],
        [],
        ["DISTRIBUCIÓN POR PRIORIDAD", "CANTIDAD"],
        ["Urgente", Number(stats.urgent) || 0],
        ["Alta", Number(stats.high) || 0],
        ["Media", Number(stats.medium) || 0],
        ["Baja", Number(stats.low) || 0],
        [],
        ["DISTRIBUCIÓN POR ESTADO", "CANTIDAD"],
        ["Abiertos", Number(stats.open) || 0],
        ["En progreso", Number(stats.progress) || 0],
        ["Resueltos", resolved],
        ["Cerrados", closed]
    ];

    const ticketRows = report.tickets.map(ticket => ({
        "Ticket": ticket.id,
        "Título": ticket.title || "",
        "Descripción": ticket.description || "Sin descripción",
        "Solicitante": ticket.reporter_name || "-",
        "Correo del solicitante": ticket.reporter_email || "-",
        "Oficina": ticket.office || "-",
        "Categoría": categoryLabel[ticket.category] || ticket.category || "Otro",
        "Estado": statusLabel[ticket.status] || ticket.status || "-",
        "Prioridad": priorityLabel[ticket.priority] || ticket.priority || "-",
        "Tiempo estimado de solución": getResolutionEstimate(ticket),
        "SLA (horas)": ticket.sla_hours ?? "-",
        "Vencimiento del SLA": dateTime(ticket.sla_due_at),
        "Responsable": ticket.assigned_name || "Sin asignar",
        "Creado": dateTime(ticket.created_at)
    }));

    const administratorRows = report.administrators.map((admin, index) => ({
        "Puesto": index + 1,
        "Administrador": admin.name,
        "Correo": admin.email,
        "Resueltos / cerrados": Number(admin.resolved_count) || 0,
        "Tickets asignados": Number(admin.assigned_count) || 0
    }));

    const workbook = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 32 }, { wch: 18 }, { wch: 3 }, { wch: 3 }, { wch: 3 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 26 }];
    const chartBlocks = [
        ["GRÁFICA · ESTADO DE TICKETS", "", "", ""],
        ["Estado", "Cantidad", "%", "Distribución"],
        ["Abiertos", Number(stats.open) || 0, chartPercent(Number(stats.open) || 0), chartBar(Number(stats.open) || 0)],
        ["En progreso", Number(stats.progress) || 0, chartPercent(Number(stats.progress) || 0), chartBar(Number(stats.progress) || 0)],
        ["Resueltos", resolved, chartPercent(resolved), chartBar(resolved)],
        ["Cerrados", closed, chartPercent(closed), chartBar(closed)],
        [],
        ["GRÁFICA · PRIORIDAD", "", "", ""],
        ["Prioridad", "Cantidad", "%", "Distribución"],
        ["Urgente", Number(stats.urgent) || 0, chartPercent(Number(stats.urgent) || 0), chartBar(Number(stats.urgent) || 0)],
        ["Alta", Number(stats.high) || 0, chartPercent(Number(stats.high) || 0), chartBar(Number(stats.high) || 0)],
        ["Media", Number(stats.medium) || 0, chartPercent(Number(stats.medium) || 0), chartBar(Number(stats.medium) || 0)],
        ["Baja", Number(stats.low) || 0, chartPercent(Number(stats.low) || 0), chartBar(Number(stats.low) || 0)]
    ];
    XLSX.utils.sheet_add_aoa(summarySheet, chartBlocks, { origin: "F1" });
    const ticketSheet = XLSX.utils.json_to_sheet(ticketRows.length ? ticketRows : [{ "Información": "No hay tickets en el periodo seleccionado." }]);
    ticketSheet["!cols"] = [
        { wch: 10 }, { wch: 32 }, { wch: 60 }, { wch: 24 }, { wch: 34 }, { wch: 18 },
        { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 28 }, { wch: 14 }, { wch: 24 }, { wch: 24 }, { wch: 24 }
    ];
    ticketSheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    const adminSheet = XLSX.utils.json_to_sheet(administratorRows.length ? administratorRows : [{ "Información": "No hay administradores con actividad en el periodo." }]);
    adminSheet["!cols"] = [{ wch: 10 }, { wch: 28 }, { wch: 36 }, { wch: 22 }, { wch: 20 }];

    const border = { style: "thin", color: { rgb: "D9E2F3" } };
    const cellBorder = { top: border, bottom: border, left: border, right: border };
    const headerStyle = {
        fill: { fgColor: { rgb: "4F46E5" } },
        font: { bold: true, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: cellBorder
    };
    const titleStyle = {
        fill: { fgColor: { rgb: "172554" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
        alignment: { vertical: "center" },
        border: cellBorder
    };
    const bodyStyle = {
        alignment: { vertical: "top", wrapText: true },
        border: cellBorder
    };
    const alternateStyle = {
        fill: { fgColor: { rgb: "F8FAFC" } },
        alignment: { vertical: "top", wrapText: true },
        border: cellBorder
    };
    const styleRange = (sheet, headerRow = 0, titleRow = -1) => {
        if (!sheet["!ref"]) return;
        const range = XLSX.utils.decode_range(sheet["!ref"]);
        for (let row = range.s.r; row <= range.e.r; row += 1) {
            for (let col = range.s.c; col <= range.e.c; col += 1) {
                const address = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = sheet[address];
                if (!cell) continue;
                cell.s = row === titleRow ? titleStyle : row === headerRow ? headerStyle : (row % 2 ? alternateStyle : bodyStyle);
            }
        }
        sheet["!autofilter"] = { ref: sheet["!ref"] };
        sheet["!rows"] = sheet["!rows"] || [];
        if (sheet["!rows"][headerRow]) sheet["!rows"][headerRow].hpt = 30;
    };
    const styleSummary = () => {
        const range = XLSX.utils.decode_range(summarySheet["!ref"]);
        for (let row = range.s.r; row <= range.e.r; row += 1) {
            for (let col = range.s.c; col <= range.e.c; col += 1) {
                const address = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = summarySheet[address];
                if (!cell) continue;
                const value = String(cell.v || "");
                const isSection = row === 0 || value === "INDICADORES" || value === "DISTRIBUCIÓN POR PRIORIDAD" || value === "DISTRIBUCIÓN POR ESTADO";
                const isHeader = value === "CANTIDAD";
                cell.s = isSection ? (row === 0 ? titleStyle : headerStyle) : (isHeader ? headerStyle : (row % 2 ? alternateStyle : bodyStyle));
            }
        }
        for (let row = range.s.r; row <= range.e.r; row += 1) {
            const label = String(summarySheet[XLSX.utils.encode_cell({ r: row, c: 0 })]?.v || "");
            if (label === "Estado" || label === "Prioridad") {
                for (let col = 0; col < 4; col += 1) {
                    const cell = summarySheet[XLSX.utils.encode_cell({ r: row, c: col })];
                    if (cell) cell.s = headerStyle;
                }
            }
            if (["Abiertos", "En progreso", "Resueltos", "Cerrados", "Urgente", "Alta", "Media", "Baja"].includes(label)) {
                const barCell = summarySheet[XLSX.utils.encode_cell({ r: row, c: 3 })];
                if (barCell) {
                    barCell.s = { ...bodyStyle, font: { bold: true, color: { rgb: label === "Urgente" ? "DC2626" : label === "Alta" ? "EA580C" : label === "En progreso" ? "0891B2" : label === "Resueltos" ? "6366F1" : "22A06B" } } };
                }
            }
        }
    };
    const styleChartBlock = (startRow, colors) => {
        for (let row = startRow; row < startRow + 6; row += 1) {
            for (let col = 5; col < 9; col += 1) {
                const cell = summarySheet[XLSX.utils.encode_cell({ r: row, c: col })];
                if (!cell) continue;
                cell.s = row === startRow ? titleStyle : row === startRow + 1 ? headerStyle : (row % 2 ? alternateStyle : bodyStyle);
            }
        }
        for (let row = startRow + 2; row < startRow + 6; row += 1) {
            const barCell = summarySheet[XLSX.utils.encode_cell({ r: row, c: 8 })];
            if (barCell) barCell.s = { ...bodyStyle, font: { bold: true, color: { rgb: colors[row - startRow - 2] } } };
        }
    };
    styleSummary();
    styleChartBlock(0, ["22A06B", "0891B2", "6366F1", "64748B"]);
    styleChartBlock(7, ["DC2626", "EA580C", "2563EB", "64748B"]);
    styleRange(ticketSheet, 0);
    styleRange(adminSheet, 0);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
    XLSX.utils.book_append_sheet(workbook, ticketSheet, "Tickets");
    XLSX.utils.book_append_sheet(workbook, adminSheet, "Administradores");
    XLSX.writeFile(workbook, `reporte-helpdesk-${report.from}-${report.to}.xlsx`);
}

function bindRanking() {
    const select = document.querySelector("#rankingPeriod");
    const content = document.querySelector("#rankingContent");
    if (!select || !content) return;
    select.addEventListener("change", async () => {
        select.disabled = true;
        content.innerHTML = `<div class="ranking-loading"><i class="bi bi-arrow-repeat"></i> Actualizando ranking...</div>`;
        try {
            const data = await getTicketRanking(select.value);
            content.innerHTML = rankingRows(data.ranking || []);
        } catch (error) {
            content.innerHTML = `<div class="ranking-empty"><p>${escapeHtml(error.message)}</p></div>`;
        } finally {
            select.disabled = false;
        }
    });
}

function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;");
}
function stat(label,value,icon,color){return `<div class="stat-card"><div class="stat-left"><small>${label}</small><h2>${value||0}</h2></div><div class="stat-icon ${color}"><i class="bi ${icon}"></i></div></div>`;}
