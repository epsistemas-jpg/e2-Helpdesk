import { renderLayout } from "../../layouts/MainLayout.js";
import { CreateTicketPage } from "../../pages/tickets/CreateTicketPage.js";
import { requireAuth } from "../../utils/router.js";
import { createTicket } from "../../services/ticketService.js";

requireAuth();

renderLayout({

    title:"Nuevo Ticket",

    active:"tickets",

    content:CreateTicketPage()

});

const remote=document.getElementById("is_remote");

const anydesk=document.getElementById("anydeskContainer");

remote.addEventListener("change",()=>{

    anydesk.style.display=

    remote.value==="1"

    ?"block"

    :"none";

});

document
.getElementById("ticketForm")
.addEventListener("submit",async(e)=>{

e.preventDefault();

const data={

title:title.value,

description:description.value,

category:category.value,

priority:priority.value,

is_remote:Number(is_remote.value),

anydesk_code:anydesk_code.value

};

try{

await createTicket(data);

Toast.success(

"Ticket creado correctamente"

);

window.location="dashboard.html";

}catch(error){

console.error(error);

Toast.error(

"No fue posible crear el ticket"

);

}

});