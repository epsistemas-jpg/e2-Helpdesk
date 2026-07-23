export function PriorityBadge(priority){

    const colors={

        urgente:"danger",

        alta:"warning",

        media:"info",

        baja:"success"

    };

    return `

<span class="badge ${colors[priority]||"secondary"}">

${priority.toUpperCase()}

</span>

`;

}