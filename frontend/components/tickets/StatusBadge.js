export function StatusBadge(status){

    const colors={

        abierto:"danger",

        en_progreso:"warning",

        resuelto:"success",

        cerrado:"secondary"

    };

    const labels={

        abierto:"Abierto",

        en_progreso:"En Progreso",

        resuelto:"Resuelto",

        cerrado:"Cerrado"

    };

    return `

<span class="badge ${colors[status]}">

${labels[status]}

</span>

`;

}