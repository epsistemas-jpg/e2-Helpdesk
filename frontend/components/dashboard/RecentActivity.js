import { Badge } from "../ui/Badge.js";

export function RecentActivity(tickets){

    return `

<div class="card recent-activity-card">

<div class="recent-activity-header"><div><span class="section-kicker">SEGUIMIENTO</span><h3>Actividad reciente</h3></div><i class="bi bi-activity"></i></div>

<div class="activity-list">

${tickets.length ? tickets.map(ticket=>`

<div class="activity-row">

<div class="activity-icon"><i class="bi bi-ticket-perforated"></i></div>
<div class="activity-main">

<div class="activity-title"><strong>Ticket #${ticket.id}</strong><span>${new Date(ticket.created_at).toLocaleDateString()}</span></div>
<div class="activity-description">${ticket.title}</div>
<div class="activity-meta"><span><i class="bi bi-building"></i>${ticket.office || "Sin oficina"}</span><span><i class="bi bi-flag"></i>${ticket.priority || "media"}</span></div>

</div>

<div class="activity-status">

${Badge(ticket.status,"success")}

</div>

</div>

`).join("") : `<div class="activity-empty"><i class="bi bi-inbox"></i><p>No hay actividad reciente</p><small>Los nuevos tickets aparecerán aquí.</small></div>`}

</div>

</div>

`;

}
