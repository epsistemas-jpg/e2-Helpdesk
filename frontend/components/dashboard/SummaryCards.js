import { StatCard } from "../cards/StatCard.js";

export function SummaryCards(stats){

    return `

<div class="stats-grid">

${StatCard({

title:"Tickets",

value:stats.total,

icon:"bi-ticket-perforated",

color:"primary"

})}

${StatCard({

title:"Abiertos",

value:stats.open,

icon:"bi-folder2-open",

color:"warning"

})}

${StatCard({

title:"En Progreso",

value:stats.progress,

icon:"bi-hourglass",

color:"info"

})}

${StatCard({

title:"Urgentes",

value:stats.urgent,

icon:"bi-exclamation-triangle",

color:"danger"

})}

</div>

`;

}