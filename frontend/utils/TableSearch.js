export function enableTableSearch(

inputId,

tableId

){

const input=document.getElementById(inputId);

const table=document.getElementById(tableId);

if(!input||!table)return;

input.addEventListener("keyup",()=>{

const filter=input.value.toLowerCase();

const rows=table.querySelectorAll("tbody tr");

rows.forEach(row=>{

const text=row.innerText.toLowerCase();

row.style.display=text.includes(filter)

?""

:"none";

});

});

}