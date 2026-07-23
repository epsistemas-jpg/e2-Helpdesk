import { TableHeader } from "./TableHeader.js";
import { TableSearch } from "./TableSearch.js";
import { TablePagination } from "./TablePagination.js";

export function DataTable({

columns,

rows,

id="table"

}){

return `

${TableSearch()}

<table id="${id}" class="data-table">

${TableHeader(columns)}

<tbody>

${rows}

</tbody>

</table>

${TablePagination(rows.match(/<tr/g)?.length || 0)}

`;

}