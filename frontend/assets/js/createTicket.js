import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { CreateTicketPage } from "../../pages/tickets/CreateTicketPage.js";
import { createTicket } from "../../services/ticketService.js";



window.alert = (message) => {

    const text = String(message);

    let icon = "info";

    if (/no fue posible|error|no se pudo/i.test(text)) {
        icon = "error";
    } else if (/correctamente/i.test(text)) {
        icon = "success";
    } else {
        icon = "warning";
    }

    Swal.fire({
        toast: true,
        position: "top-end",
        icon,
        title: text.replace(/^✅\s*/, ""),
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true
    });

};

requireAuth();

async function init() {

    const page = await CreateTicketPage();

    renderLayout({

        title: "Crear Ticket",

        active: "create-ticket",

        content: page

    });

    initEvents();

}

function initEvents(){

    const form = document.querySelector("#ticketForm");

    const remote = document.querySelector("#is_remote");

    const remoteSection = document.querySelector("#remoteSection");

    if(remote){

        remote.addEventListener("change",()=>{

            remoteSection.style.display = remote.checked ? "block" : "none";

        });

    }

    form.addEventListener("submit", submitTicket);

}

async function submitTicket(e){

    e.preventDefault();

    const btn = e.target.querySelector("button");

    btn.disabled = true;

    btn.innerText = "Creando...";

    const data = {

        title: document.querySelector("#title").value.trim(),

        description: document.querySelector("#description").value.trim(),

        category: document.querySelector("#category").value,

        priority: document.querySelector("#priority").value,

        office: document.querySelector("#office").value,

        is_remote: document.querySelector("#is_remote").checked,

        anydesk_code: document.querySelector("#anydesk_code").value.trim()

    };

    if(!data.title){

        alert("Ingrese un título.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";

        return;

    }

    if(data.description.length < 10){

        alert("La descripción debe tener al menos 10 caracteres.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";

        return;

    }

    if(data.is_remote && !data.anydesk_code){

        alert("Debe ingresar el código AnyDesk.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";

        return;

    }

    try{

        const response = await createTicket(data);

        alert(`✅ Ticket #${response.ticket.id} creado correctamente`);

        e.target.reset();

        document.querySelector("#remoteSection").style.display="none";

    }catch(err){

        console.error(err);

        alert(err.message || "No fue posible crear el ticket.");

    }

    btn.disabled=false;

    btn.innerText="Crear Ticket";

}

init();
