export function TicketForm() {

return `

<form id="ticketForm" class="ticket-form">

    <div class="form-group">

        <label>Título</label>

        <input
            type="text"
            id="title"
            required
            maxlength="200"
        >

    </div>

    <div class="form-group">

        <label>Descripción</label>

        <textarea
            id="description"
            rows="6"
            required
        ></textarea>

    </div>

    <div class="form-group">

        <label>Categoría</label>

        <select id="category">

            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="red_internet">Red / Internet</option>
            <option value="correo">Correo</option>
            <option value="impresora">Impresora</option>
            <option value="acceso_permisos">Accesos</option>
            <option value="otro">Otro</option>

        </select>

    </div>

    <div class="form-group">

        <label>Prioridad</label>

        <select id="priority">

            <option value="baja">Baja</option>
            <option value="media" selected>Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>

        </select>

    </div>

    <div class="form-group">

        <label>¿Está fuera de la oficina?</label>

        <select id="is_remote">

            <option value="0">No</option>

            <option value="1">Sí</option>

        </select>

    </div>

    <div
        class="form-group"
        id="anydeskContainer"
        style="display:none"
    >

        <label>Código AnyDesk</label>

        <input
            type="text"
            id="anydesk_code"
        >

    </div>

    <button
        type="submit"
        class="btn-primary"
    >

        Crear Ticket

    </button>

</form>

`;

}