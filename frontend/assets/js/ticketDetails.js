import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { TicketDetailsPage } from "../../pages/tickets/TicketDetailsPage.js";
import {
    assignTicket,
    getTechnicians,
    changeTicketStatus,
    addTicketComment,
    uploadTicketFile,
    closeTicket
} from "../../services/ticketService.js";


requireAuth();

async function init() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

        document.body.innerHTML = "<h2>Ticket no encontrado.</h2>";

        return;

    }

    const html = await TicketDetailsPage(id);

    renderLayout({

        title: `Ticket #${id}`,

        active: "tickets",

        content: html

    });

    const commentBtn = document.querySelector("#commentTicket");
    if (commentBtn) commentBtn.addEventListener("click", async () => {
        const { value: note } = await Swal.fire({ title: "Agregar comentario", input: "textarea", inputPlaceholder: "Escribe tu comentario...", inputValidator: value => !value.trim() ? "Escribe un comentario" : undefined, showCancelButton: true, confirmButtonText: "Guardar", cancelButtonText: "Cancelar" });
        if (!note) return;
        try { await addTicketComment(id, note); await Swal.fire({ icon: "success", title: "Comentario agregado", timer: 1100, showConfirmButton: false }); location.reload(); }
        catch (error) { Swal.fire({ icon: "error", title: error.message || "No fue posible agregar el comentario" }); }
    });

    const uploadBtn = document.querySelector("#uploadFile");
    if (uploadBtn) uploadBtn.addEventListener("click", async () => {
        const input = document.createElement("input"); input.type = "file";
        input.onchange = async () => {
            const file = input.files[0]; if (!file) return;
            if (file.size > 10 * 1024 * 1024) return Swal.fire({ icon: "warning", title: "El archivo no puede superar 10 MB" });
            try { await uploadTicketFile(id, file); await Swal.fire({ icon: "success", title: "Archivo adjuntado", timer: 1100, showConfirmButton: false }); location.reload(); }
            catch (error) { Swal.fire({ icon: "error", title: error.message || "No fue posible adjuntar el archivo" }); }
        }; input.click();
    });

    const closeBtn = document.querySelector("#closeTicket");
    if (closeBtn) closeBtn.addEventListener("click", async () => {
        const result = await Swal.fire({ title: "¿Cerrar ticket?", text: "El ticket quedará marcado como cerrado.", icon: "warning", input: "textarea", inputPlaceholder: "Comentario de cierre (opcional)", showCancelButton: true, confirmButtonText: "Sí, cerrar", cancelButtonText: "Cancelar", confirmButtonColor: "#dc2626" });
        if (!result.isConfirmed) return;
        try { await closeTicket(id, result.value || "Ticket cerrado"); await Swal.fire({ icon: "success", title: "Ticket cerrado", timer: 1200, showConfirmButton: false }); location.reload(); }
        catch (error) { Swal.fire({ icon: "error", title: error.message || "No fue posible cerrar el ticket" }); }
    });

    const assignBtn = document.querySelector("#assignTicket");

    if (assignBtn) {

        assignBtn.addEventListener("click", async () => {

            try {

                const response = await getTechnicians();

                const technicians = response.technicians || [];

                const currentAssigned = document.querySelector("#assignTicket")?.dataset.assigned || "";

                let options = "";

                technicians.forEach(user => {

                    options += `
        <option
            value="${user.id}"
            ${String(user.id) === String(currentAssigned) ? "selected" : ""}
        >
            ${user.name}
        </option>
    `;

                });

                const { value } = await Swal.fire({

                    title: "Asignar técnico",

                    html: `
                    <select id="technicianSelect" class="swal2-select">
                        ${options}
                    </select>
                `,

                    showCancelButton: true,

                    confirmButtonText: "Asignar",

                    cancelButtonText: "Cancelar",

                    preConfirm: () => {

                        return document.getElementById("technicianSelect").value;

                    }

                });

                if (!value) return;

                await assignTicket(id, value);

                await Swal.fire({

                    icon: "success",

                    title: "Ticket asignado",

                    timer: 1200,

                    showConfirmButton: false

                });

                location.reload();

            } catch (err) {

                console.error(err);

                Swal.fire({

                    icon: "error",

                    title: err.message || "No fue posible asignar el ticket."

                });

            }

        });

    }
    const statusBtn = document.querySelector("#changeStatus");

    if (statusBtn) {

        statusBtn.addEventListener("click", async () => {

            const { value: form } = await Swal.fire({

                title: "Cambiar estado",

                html: `

                <select id="ticketStatus" class="swal2-select">

                    <option value="abierto">Abierto</option>

                    <option value="en_progreso">En progreso</option>

                    <option value="resuelto">Resuelto</option>

                    <option value="cerrado">Cerrado</option>

                </select>

                <textarea
                    id="ticketNote"
                    class="swal2-textarea"
                    placeholder="Comentario (opcional)">
                </textarea>

            `,

                showCancelButton: true,

                confirmButtonText: "Guardar",

                cancelButtonText: "Cancelar",

                preConfirm: () => {

                    return {

                        status: document.getElementById("ticketStatus").value,

                        note: document.getElementById("ticketNote").value

                    };

                }

            });

            if (!form) return;

            try {

                await changeTicketStatus(id, form);

                await Swal.fire({

                    icon: "success",

                    title: "Estado actualizado",

                    timer: 1200,

                    showConfirmButton: false

                });

                location.reload();

            }

            catch (error) {

                console.error(error);

                Swal.fire({

                    icon: "error",

                    title: "No fue posible actualizar el ticket"

                });

            }

        });

    }


}


init();
