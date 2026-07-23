export function StatCard({

    title,

    value,

    icon,

    color

}){

return `

<div class="stat-card">

    <div class="stat-left">

        <small>${title}</small>

        <h2>${value}</h2>

    </div>

    <div class="stat-icon ${color}">

        <i class="bi ${icon}"></i>

    </div>

</div>

`;

}