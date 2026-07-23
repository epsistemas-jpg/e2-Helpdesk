export function TableHeader(columns){

return `

<thead>

<tr>

${columns.map(col=>`

<th>

${col}

</th>

`).join("")}

</tr>

</thead>

`;

}