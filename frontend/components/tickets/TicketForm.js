export function TicketForm(offices = []) {

    const officeOptions = `<option value="">Selecciona la ubicación</option>${offices.map(office => `
        <option value="${office}">
            ${office}
        </option>
    `).join("")}`;

    return `

        <div class="ticket-page">

            <div class="page-title">

                <h2>Crear Ticket de Soporte</h2>

                <p>Describe el inconveniente con datos concretos para que TI pueda clasificarlo y atenderlo más rápido.</p>

            </div>

            <div class="ticket-layout">

            <form id="ticketForm" class="ticket-form" novalidate>

                <div class="ticket-form-banner">
                    <div class="ticket-form-banner-icon"><i class="bi bi-stars"></i></div>
                    <div>
                        <span>ASISTENCIA INTELIGENTE</span>
                        <strong>Cuéntanos qué necesitas</strong>
                    </div>
                    <small><i class="bi bi-check2-circle"></i> Clasificación automática</small>
                </div>

                <div class="ticket-guidance" role="note">
                    <div class="ticket-guidance-icon"><i class="bi bi-lightbulb"></i></div>
                    <div>
                        <strong>¿Qué debe incluir?</strong>
                        <span>Qué ocurrió, desde cuándo, a quién afecta y qué intentaste hacer. No incluyas contraseñas ni códigos de seguridad.</span>
                    </div>
                </div>

                <div class="form-group">

                    <label for="title" class="field-label-with-icon">
                        <span class="field-label-icon"><i class="bi bi-file-earmark-text"></i></span>
                        Título
                    </label>

                    <div class="field-with-mic">
                        <input
                            id="title"
                            name="title"
                            type="text"
                            maxlength="200"
                            placeholder="Ej: Outlook no abre"
                            autocomplete="off"
                            aria-describedby="titleHelp"
                            required
                        >
                        <button type="button" class="voice-input-btn" data-voice-target="title" aria-label="Dictar título" title="Dictar título">
                            <i class="bi bi-mic-fill"></i>
                        </button>
                    </div>

                    <small id="titleHelp" class="field-help"><span id="titleCount">0</span>/200 caracteres</small>

                    <div id="problemSuggestions" class="problem-suggestions" aria-live="polite" hidden>
                        <div class="suggestions-heading"><i class="bi bi-stars"></i><span>Sugerencias relacionadas</span></div>
                        <div id="problemSuggestionsList" class="suggestions-list"></div>
                    </div>

                </div>

                <div class="form-group">

                    <label for="description" class="field-label-with-icon">
                        <span class="field-label-icon"><i class="bi bi-chat-square-text"></i></span>
                        Descripción
                    </label>

                    <div class="field-with-mic field-with-mic-textarea">
                        <textarea
                            id="description"
                            name="description"
                            rows="6"
                            maxlength="5000"
                            minlength="20"
                            placeholder="Escribe un título y la IA te mostrará un ejemplo para completar la descripción..."
                            aria-describedby="descriptionHelp"
                            required
                        ></textarea>
                        <button type="button" class="voice-input-btn" data-voice-target="description" aria-label="Dictar descripción" title="Dictar descripción">
                            <i class="bi bi-mic-fill"></i>
                        </button>
                    </div>

                    <small id="descriptionHelp" class="field-help"><span id="descriptionCount">0</span>/5000 caracteres · mínimo 20</small>

                    <div id="descriptionSuggestion" class="description-suggestion" aria-live="polite" hidden>
                        <i class="bi bi-stars"></i>
                        <span><strong>Guía para describirlo:</strong> <span id="descriptionSuggestionText"></span></span>
                    </div>

                </div>

                <div class="ticket-options-grid">

                    <div class="form-group">

                        <label for="category" class="field-label-with-icon">
                            <span class="field-label-icon"><i class="bi bi-folder2-open"></i></span>
                            Categoría
                        </label>

                        <select
                            id="category"
                            disabled
                            aria-disabled="true"
                            aria-describedby="categoryHelp"
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

                            <option value="otro" selected>
                                Otro
                            </option>

                        </select>

                        <input type="hidden" id="categoryValue" name="category" value="otro">
                        <small id="categoryHelp" class="field-help category-help"><i class="bi bi-lock-fill"></i> Se asigna automáticamente según el título y no se puede editar.</small>

                    </div>

                    <div class="form-group">

                        <label for="office" class="field-label-with-icon">
                            <span class="field-label-icon"><i class="bi bi-geo-alt-fill"></i></span>
                            Oficina
                        </label>

                        <select
                            id="office"
                            name="office"
                        >

                            ${officeOptions || '<option value="">Se usará tu oficina registrada</option>'}

                        </select>

                        <small class="field-help">Indica dónde necesitas la atención.</small>

                    </div>

                </div>

                <div class="remote-access-section">
                    <div class="remote-access-heading">
                        <div>
                            <strong class="field-label-with-icon"><span class="field-label-icon"><i class="bi bi-display"></i></span>Atención remota</strong>
                            <span>Actívala solo si no estás en la oficina y el equipo de soporte necesita conectarse.</span>
                        </div>
                    </div>

                    <div class="checkbox">

                        <label>

                            <input
                                id="is_remote"
                                name="is_remote"
                                type="checkbox"
                            >

                            <span>Necesito atención remota</span>

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
                                inputmode="numeric"
                                autocomplete="off"

                            >

                            <small class="field-help">Compártelo únicamente cuando el equipo de soporte te lo solicite.</small>

                        </div>

                    </div>
                </div>

                <div class="ticket-attachments-form">
                    <div class="ticket-attachments-heading">
                        <div>
                            <strong><i class="bi bi-images"></i> Evidencia del problema</strong>
                            <span>Adjunta capturas de pantalla o fotos que ayuden a entender el inconveniente.</span>
                        </div>
                        <label class="attachment-picker" for="ticketImages"><i class="bi bi-paperclip"></i> Adjuntar imágenes</label>
                        <input id="ticketImages" name="ticketImages" type="file" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden>
                    </div>
                    <div id="ticketImagePreview" class="ticket-image-preview" aria-live="polite"></div>
                    <small class="field-help">Máximo 5 imágenes de 10 MB cada una.</small>
                </div>

                <div class="actions">

                    <span id="ticketSubmitStatus" class="ticket-submit-status" aria-live="polite"></span>

                    <button
                        class="btn-primary"
                        type="submit"
                    >

                        <span>Crear Ticket</span>
                        <i class="bi bi-arrow-right"></i>

                    </button>

                </div>

            </form>

            <aside class="ticket-help-column" aria-label="Consejos para crear un ticket">
                <section class="ticket-help-card ticket-tips-card">
                    <div class="ticket-help-icon"><i class="bi bi-lightning-charge-fill"></i></div>
                    <h3>Consejos rápidos</h3>
                    <ul>
                        <li><i class="bi bi-check-circle-fill"></i> Sé específico con el problema.</li>
                        <li><i class="bi bi-check-circle-fill"></i> Indica desde cuándo ocurre.</li>
                        <li><i class="bi bi-check-circle-fill"></i> Menciona a quién afecta.</li>
                        <li><i class="bi bi-check-circle-fill"></i> No incluyas contraseñas ni códigos de seguridad.</li>
                    </ul>
                </section>

                <section class="ticket-help-card ticket-contact-card">
                    <div class="ticket-contact-illustration"><i class="bi bi-person-workspace"></i></div>
                    <h3>¿Necesitas ayuda?</h3>
                    <p>Si tienes dudas o el problema es urgente, puedes comunicarte con el equipo de soporte.</p>
                    <a href="#" data-open-assistant class="ticket-help-button">
                        <i class="bi bi-chat-square-text"></i> Contactar soporte
                    </a>
                </section>
            </aside>

            </div>

        </div>

    `;
}
