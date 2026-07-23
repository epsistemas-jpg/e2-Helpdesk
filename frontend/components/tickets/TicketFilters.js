export function TicketFilters() {

    return `

        <div class="ticket-filters">

            <input

                id="searchTicket"

                placeholder="Buscar ticket..."

            >

            <select id="filterStatus">

                <option value="">Todos los estados</option>

                <option value="abierto">Abierto</option>

                <option value="en_progreso">En progreso</option>

                <option value="resuelto">Resuelto</option>

                <option value="cerrado">Cerrado</option>

            </select>

            <select id="filterPriority">

                <option value="">Todas las prioridades</option>

                <option value="urgente">Urgente</option>

                <option value="alta">Alta</option>

                <option value="media">Media</option>

                <option value="baja">Baja</option>

            </select>

        </div>

    `;

}