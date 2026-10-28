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

function appendSuggestedQuestions(container, questions, ask) {
    if (!container || !Array.isArray(questions) || !questions.length) return;
    const group = document.createElement('div');
    group.className = 'assistant-followups';
    questions.slice(0, 3).forEach(question => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'assistant-followup';
        button.textContent = question;
        button.addEventListener('click', () => ask(question));
        group.appendChild(button);
    });
    container.appendChild(group);
    container.scrollTop = container.scrollHeight;
}

export function initAssistantChat() {
    const launcher = document.querySelector('#assistantLauncher');
    const panel = document.querySelector('#assistantPanel');
    const close = document.querySelector('#assistantClose');
    const form = document.querySelector('#assistantForm');
    const input = document.querySelector('#assistantQuestion');
    const messages = document.querySelector('#assistantMessages');
    const quickActions = document.querySelector('#assistantQuickActions');
    if (!launcher || !panel || !close || !form || !input || !messages) return;
    const history = [];
    const open = () => { panel.hidden = false; input.focus(); };
    launcher.addEventListener('click', open);
    close.addEventListener('click', () => { panel.hidden = true; });
    document.querySelectorAll('[data-open-assistant]').forEach(button => button.addEventListener('click', event => { event.preventDefault(); open(); }));
    const ask = async question => {
        if (!question) return;
        appendMessage(messages, question, 'user');
        history.push({ role: 'user', text: question });
        input.value = '';
        input.disabled = true;
        appendMessage(messages, 'Estoy revisando tu consulta...', 'bot assistant-message-loading');
        try {
            const response = await api.post('/assistant/chat', { question, history });
            messages.querySelector('.assistant-message-loading')?.remove();
            appendMessage(messages, response.reply, 'bot');
            history.push({ role: 'assistant', text: response.reply });
            if (response.needsTicket || /crear un ticket|crea un ticket|registra un ticket/i.test(response.reply)) {
                appendCreateTicketLink(messages);
            }
            appendSuggestedQuestions(messages, response.suggestedQuestions, ask);
        } catch (error) {
            messages.querySelector('.assistant-message-loading')?.remove();
            appendMessage(messages, error.message || 'No fue posible responder ahora.', 'bot');
        } finally { input.disabled = false; input.focus(); }
    };
    form.addEventListener('submit', async event => {
        event.preventDefault();
        await ask(input.value.trim());
    });
    quickActions?.querySelectorAll('[data-assistant-question]').forEach(button => {
        button.addEventListener('click', () => ask(button.dataset.assistantQuestion || ''));
    });
}
