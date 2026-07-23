export function TicketForm(offices = []) {

    const officeOptions = offices.map(office => `
        <option value="${office}">
            ${office}
        </option>
    `).join("");

    return `

        <div class="ticket-page">

            <div class="page-title">

                <h2>Crear Ticket de Soporte</h2>

                <p>
                    Describe el inconveniente para que el equipo de TI pueda atenderlo.
                </p>

            </div>

            <form id="ticketForm" class="ticket-form">

                <div class="form-group">

                    <label for="title">
                        Título
                    </label>

                    <input
                        id="title"
                        name="title"
                        type="text"
                        maxlength="200"
                        placeholder="Ej: Outlook no abre"
                        required
                    >

                </div>

                <div class="form-group">

                    <label for="description">
                        Descripción
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows="6"
                        maxlength="5000"
                        placeholder="Describe detalladamente el problema..."
                        required
                    ></textarea>

                </div>

                <div class="row">

                    <div class="form-group">

                        <label for="category">
                            Categoría
                        </label>

                        <select
                            id="category"
                            name="category"
                        >

                            <option value="hardware">Hardware</option>

                            <option value="software">Software</option>

                            <option value="red_internet">
                                Red / Internet
                            </option>

                            <option value="correo">
                                Correo
                            </option>

                            <option value="impresora">
                                Impresora
                            </option>

                            <option value="acceso_permisos">
                                Accesos / Permisos
                            </option>

                            <option value="otro">
                                Otro
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label for="priority">
                            Prioridad
                        </label>

                        <select
                            id="priority"
                            name="priority"
                        >

                            <option value="baja">
                                Baja
                            </option>

                            <option
                                value="media"
                                selected
                            >
                                Media
                            </option>

                            <option value="alta">
                                Alta
                            </option>

                            <option value="urgente">
                                Urgente
                            </option>

                        </select>

                    </div>

                </div>

                <div class="form-group">

                    <label for="office">
                        Oficina
                    </label>

                    <select
                        id="office"
                        name="office"
                    >

                        ${officeOptions}

                    </select>

                </div>

                <div class="checkbox">

                    <label>

                        <input
                            id="is_remote"
                            name="is_remote"
                            type="checkbox"
                        >

                        Estoy fuera de la oficina

                    </label>

                </div>

                <div id="remoteSection">

                    <div class="form-group">

                        <label for="anydesk_code">

                            Código AnyDesk

                        </label>

                        <input

                            id="anydesk_code"

                            name="anydesk_code"

                            type="text"

                            placeholder="Ej: 123 456 789"

                        >

                    </div>

                </div>

                <div class="actions">

                    <button
                        class="btn-primary"
                        type="submit"
                    >

                        Crear Ticket

                    </button>

                </div>

            </form>

        </div>

    `;
}