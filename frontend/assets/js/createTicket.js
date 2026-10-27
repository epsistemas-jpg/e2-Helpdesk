import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { CreateTicketPage } from "../../pages/tickets/CreateTicketPage.js";
import { createTicket } from "../../services/ticketService.js";
import api from "../../services/api.js";



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

const LOCAL_PROBLEM_SUGGESTIONS = {
    teclado: ["Teclado no responde", "Teclado escribe caracteres incorrectos", "Teclas del teclado están atascadas"],
    mouse: ["Mouse no responde", "Mouse se mueve de forma intermitente", "No funciona el clic del mouse"],
    internet: ["No hay conexión a internet", "Internet está lento o intermitente", "No puedo conectarme a la red Wi-Fi"],
    correo: ["No puedo enviar correos", "No puedo recibir correos", "Outlook no abre o muestra un error"],
    outlook: ["Outlook no abre", "Outlook no sincroniza los correos", "No puedo enviar correos desde Outlook"],
    impresora: ["Impresora no imprime", "No puedo conectarme a la impresora", "La impresión sale con errores"],
    pantalla: ["Pantalla sin imagen", "Pantalla parpadea", "Monitor no enciende"],
    acceso: ["No puedo acceder a un sistema", "Necesito solicitar un permiso", "Mi usuario está bloqueado"]
};

function getLocalSuggestions(text) {
    const normalized = String(text || "").toLowerCase();
    return [...new Set(Object.entries(LOCAL_PROBLEM_SUGGESTIONS)
        .filter(([keyword]) => normalized.includes(keyword))
        .flatMap(([, suggestions]) => suggestions))].slice(0, 5);
}

function getLocalCategory(text) {
    const normalized = String(text || "").toLowerCase();
    if (/teclado|mouse|pantalla|monitor|computador|computadora/.test(normalized)) return "hardware";
    if (/internet|wifi|wi-fi|red|conexión|conexion/.test(normalized)) return "red_internet";
    if (/correo|outlook|email|e-mail/.test(normalized)) return "correo";
    if (/impresora|imprimir|impresión|impresion/.test(normalized)) return "impresora";
    if (/contraseña|contrasena|acceso|permiso|usuario bloqueado|iniciar sesión|iniciar sesion/.test(normalized)) return "acceso_permisos";
    if (/programa|aplicación|aplicacion|software|sistema|error al abrir/.test(normalized)) return "software";
    return "otro";
}

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

            if (remoteSection) {
                remoteSection.style.display = remote.checked ? "block" : "none";
            }

        });

    }

    if (!form) {
        console.error("No se encontró el formulario #ticketForm.");
        return;
    }

    form.addEventListener("submit", submitTicket);

    const title = form.querySelector("#title");
    const description = form.querySelector("#description");
    const titleCount = form.querySelector("#titleCount");
    const descriptionCount = form.querySelector("#descriptionCount");
    const updateCount = (field, counter) => {
        if (field && counter) counter.textContent = String(field.value.length);
    };
    [[title, titleCount], [description, descriptionCount]].forEach(([field, counter]) => {
        field?.addEventListener("input", () => updateCount(field, counter));
        updateCount(field, counter);
    });

    const suggestionsPanel = form.querySelector("#problemSuggestions");
    const suggestionsList = form.querySelector("#problemSuggestionsList");
    let suggestionTimer;
    let suggestionController;
    const renderSuggestions = (suggestions = []) => {
        if (!suggestionsPanel || !suggestionsList) return;
        suggestionsList.replaceChildren();
        suggestions.slice(0, 5).forEach((suggestion) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "problem-suggestion";
            button.textContent = suggestion;
            button.addEventListener("click", () => {
                if (title) {
                    title.value = suggestion;
                    title.dispatchEvent(new Event("input", { bubbles: true }));
                    title.focus();
                }
                suggestionsPanel.hidden = true;
            });
            suggestionsList.appendChild(button);
        });
        suggestionsPanel.hidden = suggestions.length === 0;
    };
    const loadSuggestions = () => {
        clearTimeout(suggestionTimer);
        suggestionTimer = setTimeout(async () => {
            const text = String(title?.value || "").trim();
            if (text.length < 3) return renderSuggestions([]);
            const fallbackSuggestions = getLocalSuggestions(text);
            const fallbackCategory = getLocalCategory(text);
            renderSuggestions([]);
            if (suggestionsPanel) suggestionsPanel.hidden = false;
            const heading = suggestionsPanel?.querySelector(".suggestions-heading span");
            if (heading) heading.textContent = "Cargando sugerencias...";
            const descriptionSuggestion = form.querySelector("#descriptionSuggestion");
            const descriptionSuggestionText = form.querySelector("#descriptionSuggestionText");
            if (descriptionSuggestion) descriptionSuggestion.hidden = true;
            const category = form.querySelector("#category");
            const categoryValue = form.querySelector("#categoryValue");
            suggestionController?.abort();
            suggestionController = new AbortController();
            try {
                const result = await api.post("/tickets/suggestions", { text }, { signal: suggestionController.signal });
                renderSuggestions(result.suggestions || []);
                if (heading) heading.textContent = "Sugerencias disponibles";
                if (descriptionSuggestionText && result.descriptionSuggestion) {
                    descriptionSuggestionText.textContent = result.descriptionSuggestion;
                    if (descriptionSuggestion) descriptionSuggestion.hidden = false;
                }
                if (category && result.category) category.value = result.category;
                if (categoryValue && result.category) categoryValue.value = result.category;
            } catch (error) {
                if (error.name !== "AbortError") {
                    renderSuggestions(fallbackSuggestions);
                    if (heading) heading.textContent = "Sugerencias de respaldo";
                    if (descriptionSuggestionText) {
                        descriptionSuggestionText.textContent = `Describe qué ocurre con “${text}”, desde cuándo sucede, a quién afecta y qué intentaste.`;
                        if (descriptionSuggestion) descriptionSuggestion.hidden = false;
                    }
                    if (category && fallbackCategory) category.value = fallbackCategory;
                    if (categoryValue && fallbackCategory) categoryValue.value = fallbackCategory;
                    console.warn("Sugerencias no disponibles:", error.message);
                }
            }
        }, 600);
    };
    title?.addEventListener("input", loadSuggestions);

    setupVoiceInputs(form, title, description);

}

function setupVoiceInputs(form, title, description) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const buttons = form.querySelectorAll("[data-voice-target]");
    if (!buttons.length) return;
    if (!SpeechRecognition) {
        buttons.forEach(button => {
            button.title = "Dictado no compatible en este navegador";
            button.disabled = true;
        });
        return;
    }

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const target = button.dataset.voiceTarget === "description" ? description : title;
            if (!target) return;
            const recognition = new SpeechRecognition();
            recognition.lang = "es-CO";
            recognition.interimResults = true;
            recognition.continuous = false;
            const originalValue = target.value.trim();
            let committed = false;
            let finalTranscript = "";
            const cleanTranscript = (value) => String(value || "")
                .replace(/\s+/g, " ")
                .replace(/\s+([,.!?;:])/g, "$1")
                .trim();
            const mergeTranscript = (current, next) => {
                const left = cleanTranscript(current);
                const right = cleanTranscript(next);
                if (!left) return right;
                if (!right) return left;
                if (right.toLowerCase().includes(left.toLowerCase())) return right;
                if (left.toLowerCase().includes(right.toLowerCase())) return left;
                const leftWords = left.split(" ");
                const rightWords = right.split(" ");
                let overlap = 0;
                const maxOverlap = Math.min(leftWords.length, rightWords.length);
                for (let size = 1; size <= maxOverlap; size += 1) {
                    const leftPart = leftWords.slice(-size).join(" ").toLowerCase();
                    const rightPart = rightWords.slice(0, size).join(" ").toLowerCase();
                    if (leftPart === rightPart) overlap = size;
                }
                return cleanTranscript(`${left} ${rightWords.slice(overlap).join(" ")}`);
            };
            button.classList.add("recording");
            button.title = "Escuchando... pulsa para detener";
            recognition.onresult = (event) => {
                if (committed) return;
                for (let index = event.resultIndex || 0; index < event.results.length; index += 1) {
                    const result = event.results[index];
                    if (result.isFinal) {
                        finalTranscript = mergeTranscript(finalTranscript, result[0]?.transcript || "");
                    }
                }
                if (finalTranscript) {
                    committed = true;
                    target.value = target === title
                        ? finalTranscript
                        : `${originalValue}${originalValue ? "\n" : ""}${finalTranscript}`;
                    target.dispatchEvent(new Event("input", { bubbles: true }));
                    recognition.stop();
                }
            };
            recognition.onerror = () => {
                button.title = "No se pudo usar el micrófono";
            };
            recognition.onend = () => {
                button.classList.remove("recording");
                button.title = target === title ? "Dictar título" : "Dictar descripción";
            };
            recognition.start();
        });
    });
}

async function submitTicket(e){

    e.preventDefault();

    const form = e.currentTarget || e.target;
    const btn = form.querySelector("button[type='submit']");

    if (!form || !btn) {
        console.error("El formulario de tickets está incompleto.");
        alert("No se pudo cargar correctamente el formulario. Recarga la página.");
        return;
    }

    btn.disabled = true;

    btn.innerText = "Creando...";
    const submitStatus = form.querySelector("#ticketSubmitStatus");
    if (submitStatus) submitStatus.textContent = "Analizando prioridad y SLA...";

    // FormData evita errores si una variante del formulario no contiene un campo opcional.
    const formData = new FormData(form);
    const value = (name) => String(formData.get(name) || "").trim();
    const remoteField = form.querySelector("#is_remote");
    const data = {
        title: value("title"),
        description: value("description"),
        category: value("category") || "otro",
        office: value("office"),
        is_remote: Boolean(remoteField?.checked),
        anydesk_code: value("anydesk_code")
    };

    if(data.title.length < 5){

        alert("El título debe tener al menos 5 caracteres.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";
        if (submitStatus) submitStatus.textContent = "";

        return;

    }

    if(data.description.length < 20){

        alert("La descripción debe tener al menos 20 caracteres.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";
        if (submitStatus) submitStatus.textContent = "";

        return;

    }

    if(data.is_remote && !data.anydesk_code){

        alert("Debe ingresar el código AnyDesk.");

        btn.disabled=false;

        btn.innerText="Crear Ticket";
        if (submitStatus) submitStatus.textContent = "";

        return;

    }

    try{

        const response = await createTicket(data);

        const priority = response.ticket.priority || "media";
        const sla = response.ticket.sla_hours ? `${response.ticket.sla_hours} h` : "24 h";
        alert(`✅ Ticket #${response.ticket.id} creado correctamente. Prioridad: ${priority.toUpperCase()} · SLA: ${sla}`);

        form.reset();

        const category = form.querySelector("#category");
        const categoryValue = form.querySelector("#categoryValue");
        if (category) category.value = "otro";
        if (categoryValue) categoryValue.value = "otro";

        const remoteSection = form.querySelector("#remoteSection");
        if (remoteSection) remoteSection.style.display="none";

    }catch(err){

        console.error(err);

        alert(err.message || "No fue posible crear el ticket.");

    }

    btn.disabled=false;

    btn.innerText="Crear Ticket";
    if (submitStatus) submitStatus.textContent = "";

}

init();
