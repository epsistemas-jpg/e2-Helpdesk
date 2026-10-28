export function AssistantChat() {
    return `
        <button id="assistantLauncher" class="assistant-launcher" type="button" aria-label="Abrir asistente de soporte" title="Asistente de soporte">
            <i class="bi bi-stars"></i><span>Ayuda TI</span>
        </button>
        <aside id="assistantPanel" class="assistant-panel" aria-label="Asistente de soporte" hidden>
            <div class="assistant-panel-header">
                <div class="assistant-brand-icon"><i class="bi bi-stars"></i></div>
                <div><strong>Asistente de soporte</strong><span>Resuelve dudas y consulta tus tickets</span></div>
                <button id="assistantClose" class="assistant-close" type="button" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
            </div>
                <div id="assistantQuickActions" class="assistant-quick-actions" aria-label="Preguntas frecuentes">
                    <button type="button" data-assistant-question="¿Cómo creo un ticket de soporte?">Crear un ticket</button>
                    <button type="button" data-assistant-question="¿Dónde reviso el estado y SLA de mis tickets?">Ver mis tickets</button>
                    <button type="button" data-assistant-question="Tengo un error urgente y necesito ayuda">Tengo una urgencia</button>
                </div>
                <div id="assistantMessages" class="assistant-messages" role="log" aria-live="polite">
                <div class="assistant-message assistant-message-bot">Hola. Puedo ayudarte con dudas de TI, estados y SLA de tus tickets.</div>
            </div>
            <form id="assistantForm" class="assistant-form">
                <input id="assistantQuestion" type="text" maxlength="2000" placeholder="Escribe tu pregunta..." autocomplete="off" required>
                <button type="submit" aria-label="Enviar"><i class="bi bi-arrow-up"></i></button>
            </form>
        </aside>`;
}
