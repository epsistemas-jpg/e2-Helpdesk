export function TableSearch(id = "tableSearch") {

    return `

<div class="table-toolbar">

    <input
        type="text"
        id="${id}"
        class="table-search"
        placeholder="🔍 Buscar..."
    >

</div>

`;

}