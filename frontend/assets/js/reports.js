import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { getReportData, getTicketRanking } from "../../services/reportService.js";
import { Storage } from "../../utils/storage.js";
if (requireAuth()) init();
async function init() {
    const user = Storage.getUser() || {};
    if (!["admin", "support"].includes(user.role)) return;

    try {
        const { stats, tickets } = await getReportData();
        const ranking = user.role === "admin" ? await getTicketRanking("mensual") : null;
        renderLayout({
            title: "Reportes",
            active: "reports",
            content: `
                <div class="stats-grid">
                    ${stat("Total de tickets", stats.total, "bi-ticket-perforated", "primary")}
                    ${stat("Abiertos", stats.open, "bi-inbox", "warning")}
                    ${stat("En progreso", stats.progress, "bi-hourglass-split", "info")}
                    ${stat("Resueltos / cerrados", Number(stats.resolved) + Number(stats.closed), "bi-check2-circle", "success")}
                </div>
                ${user.role === "admin" ? rankingMarkup(ranking) : ""}
                <div class="section">
                    <h3>Tickets recientes</h3>
                    <table class="ticket-table"><thead><tr><th>#</th><th>Título</th><th>Estado</th><th>Prioridad</th><th>Oficina</th><th>Creado</th></tr></thead>
                    <tbody>${tickets.length ? tickets.slice(0, 30).map(t => `<tr><td>${t.id}</td><td>${escapeHtml(t.title)}</td><td>${escapeHtml(t.status)}</td><td>${escapeHtml(t.priority)}</td><td>${escapeHtml(t.office || "-")}</td><td>${new Date(t.created_at).toLocaleDateString()}</td></tr>`).join("") : `<tr><td colspan="6" class="empty-table">No hay tickets registrados.</td></tr>`}</tbody></table>
                </div>
            `
        });
        if (user.role === "admin") bindRanking();
    } catch (error) {
        renderLayout({ title: "Reportes", active: "reports", content: `<div class="section"><h3>No fue posible cargar los reportes</h3><p>${escapeHtml(error.message)}</p></div>` });
    }
}

function rankingMarkup(data) {
    return `<section class="section ranking-section"><div class="ranking-header"><div><span class="section-kicker">ADMINISTRACIÓN</span><h3>Ranking de tickets creados</h3><p>Compara quién registra más solicitudes en cada periodo.</p></div><select id="rankingPeriod" aria-label="Periodo del ranking"><option value="semanal">Semanal</option><option value="mensual" selected>Mensual</option><option value="anual">Anual</option></select></div><div id="rankingContent">${rankingRows(data?.ranking || [])}</div></section>`;
}

function rankingRows(ranking) {
    if (!ranking.length) return `<div class="ranking-empty"><i class="bi bi-bar-chart"></i><p>No hay tickets registrados en este periodo.</p></div>`;
    return `<div class="ranking-table-wrap"><table class="ticket-table ranking-table"><thead><tr><th>Puesto</th><th>Empleado</th><th>Correo</th><th>Tickets</th></tr></thead><tbody>${ranking.map((item, index) => `<tr><td><span class="ranking-position position-${index + 1}">${index + 1}</span></td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.email)}</td><td><strong>${Number(item.ticket_count) || 0}</strong></td></tr>`).join("")}</tbody></table></div>`;
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
