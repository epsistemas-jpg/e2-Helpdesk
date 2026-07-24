import { TicketRow } from "./TicketRow.js";

export function TicketTable(tickets = []) {

    if (!tickets.length) {

        return `
            <div class="empty-table">
                <i class="bi bi-ticket-perforated"></i>
                <h3>No hay tickets registrados</h3>
            </div>
        `;

    }

    setTimeout(() => {

        document.querySelectorAll(".view-ticket").forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.id;

                window.location.href =
                    `/pages/tickets/ticketDetails.html?id=${id}`;

            });

        });

    }, 0);

    return `

        <table class="ticket-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Título</th>

                    <th>Categoría</th>

                    <th>Prioridad</th>

                    <th>Estado</th>

                    <th>Asignado a</th>

                    <th>Solicitante</th>

                    <th>Fecha</th>

                    <th>Acciones</th>

                </tr>

            </thead>

            <tbody>

                ${tickets.map(TicketRow).join("")}

            </tbody>

        </table>

    `;
}
