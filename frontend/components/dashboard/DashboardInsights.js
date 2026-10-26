export function DashboardInsights(stats = {}) {
    const total = Number(stats.total) || 0;
    const resolved = Number(stats.resolved) || 0;
    const closed = Number(stats.closed) || 0;
    const open = Number(stats.open) || 0;
    const progress = Number(stats.progress) || 0;
    const urgent = Number(stats.urgent) || 0;
    const completed = resolved + closed;
    const completion = total ? Math.round((completed / total) * 100) : 0;
    const active = open + progress;
    const resolvedPercent = total ? Math.round((resolved / total) * 100) : 0;
    const activePercent = total ? Math.round((active / total) * 100) : 0;
    const urgentPercent = total ? Math.max(4, Math.round((urgent / total) * 100)) : 4;

    return `
        <section class="dashboard-insights" aria-label="Resumen inteligente de soporte">
            <div class="insight-panel">
                <div class="insight-panel-heading">
                    <div>
                        <span class="section-kicker">VISIÓN GENERAL</span>
                        <h3>Panel de información</h3>
                    </div>
                    <i class="bi bi-stars"></i>
                </div>

                <div class="insight-kpis">
                    <div class="insight-kpi">
                        <span>Casos completados</span>
                        <strong>${completion}%</strong>
                    </div>
                    <div class="insight-kpi">
                        <span>Atención activa</span>
                        <strong>${active}</strong>
                    </div>
                </div>

                <div class="insight-chart-row">
                    <div class="insight-donut" style="--resolved:${resolvedPercent}%;--active:${activePercent}%;--urgent:${urgentPercent}%" aria-label="${completion}% de tickets completados">
                        <div><strong>${completion}%</strong><span>resueltos</span></div>
                    </div>
                    <div class="insight-legend">
                        <span><i class="legend-dot resolved"></i>Resueltos y cerrados <b>${completed}</b></span>
                        <span><i class="legend-dot active"></i>En atención <b>${active}</b></span>
                        <span><i class="legend-dot urgent"></i>Urgentes <b>${urgent}</b></span>
                    </div>
                </div>
            </div>

            <div class="insight-status-panel" aria-label="Estado de tickets">
                <div class="insight-status-heading">
                    <div>
                        <span class="section-kicker">SEGUIMIENTO</span>
                        <h3>Estado de tus tickets</h3>
                    </div>
                    <a href="/pages/tickets/createTicket.html" class="insight-action"><i class="bi bi-plus-lg"></i> Crear ticket</a>
                </div>
                <div class="status-progress-list">
                    <div class="status-progress-row">
                        <div><span><i class="bi bi-inbox"></i>Abiertos</span><b>${open}</b></div>
                        <div class="status-progress-track"><span class="status-progress-open" style="width:${total ? Math.max(open ? 6 : 0, Math.round((open / total) * 100)) : 0}%"></span></div>
                    </div>
                    <div class="status-progress-row">
                        <div><span><i class="bi bi-hourglass-split"></i>En progreso</span><b>${progress}</b></div>
                        <div class="status-progress-track"><span class="status-progress-progress" style="width:${total ? Math.max(progress ? 6 : 0, Math.round((progress / total) * 100)) : 0}%"></span></div>
                    </div>
                    <div class="status-progress-row">
                        <div><span><i class="bi bi-check2-circle"></i>Resueltos o cerrados</span><b>${completed}</b></div>
                        <div class="status-progress-track"><span class="status-progress-completed" style="width:${completion}%"></span></div>
                    </div>
                </div>
                <div class="insight-status-footer"><i class="bi bi-shield-check"></i><span>${urgent ? `${urgent} ticket${urgent === 1 ? " necesita" : " necesitan"} atención prioritaria.` : "No tienes tickets urgentes pendientes."}</span></div>
            </div>
        </section>
    `;
}
