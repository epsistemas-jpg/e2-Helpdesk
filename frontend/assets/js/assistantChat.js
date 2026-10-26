import api from '../../services/api.js';

function appendMessage(container, text, type) {
    if (!container) return;
    const message = document.createElement('div');
    message.className = `assistant-message assistant-message-${type}`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

function appendCreateTicketLink(container) {
    if (!container) return;
    const link = document.createElement('a');
    link.href = '/pages/tickets/createTicket.html';
    link.className = 'assistant-create-ticket';
    link.innerHTML = '<i class="bi bi-plus-circle"></i> Crear ticket';
    link.addEventListener('click', () => { window.location.href = link.href; });
    container.appendChild(link);
    container.scrollTop = container.scrollHeight;
}

export function initAssistantChat() {
    const launcher = document.querySelector('#assistantLauncher');
    const panel = document.querySelector('#assistantPanel');
    const close = document.querySelector('#assistantClose');
    const form = document.querySelector('#assistantForm');
    const input = document.querySelector('#assistantQuestion');
    const messages = document.querySelector('#assistantMessages');
    if (!launcher || !panel || !close || !form || !input || !messages) return;
    const open = () => { panel.hidden = false; input.focus(); };
    launcher.addEventListener('click', open);
    close.addEventListener('click', () => { panel.hidden = true; });
    document.querySelectorAll('[data-open-assistant]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); open(); }));
    form.addEventListener('submit', async event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) return;
        appendMessage(messages, question, 'user');
        input.value = '';
        input.disabled = true;
        appendMessage(messages, 'Estoy revisando tu consulta...', 'bot assistant-message-loading');
        try {
            const response = await api.post('/assistant/chat', { question });
            messages.querySelector('.assistant-message-loading')?.remove();
            appendMessage(messages, response.reply, 'bot');
            if (/crear un ticket|crea un ticket|registra un ticket/i.test(response.reply)) {
                appendCreateTicketLink(messages);
            }
        } catch (error) {
            messages.querySelector('.assistant-message-loading')?.remove();
            appendMessage(messages, error.message || 'No fue posible responder ahora.', 'bot');
        } finally { input.disabled = false; input.focus(); }
    });
}
