import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { CreateTicketPage } from "../../pages/tickets/CreateTicketPage.js";
import { createTicket, uploadTicketFile } from "../../services/ticketService.js";
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
    toner: ["La impresora muestra poco tóner", "La impresión sale clara o con manchas", "Necesito cambiar el cartucho de tóner"],
    tonner: ["La impresora muestra poco tóner", "La impresión sale clara o con manchas", "Necesito cambiar el cartucho de tóner"],
    pantalla: ["Pantalla sin imagen", "Pantalla parpadea", "Monitor no enciende"],
    acceso: ["No puedo acceder a un sistema", "Necesito solicitar un permiso", "Mi usuario está bloqueado"],
    sap: ["SAP no abre o no inicia correctamente", "SAP muestra un error", "No puedo completar una tarea en SAP"],
    "power bi": ["Power BI no carga el informe", "Power BI muestra un error", "No puedo actualizar un informe en Power BI"],
    teams: ["Microsoft Teams no abre", "No puedo entrar a una reunión en Teams", "Teams no permite enviar mensajes"],
    sharepoint: ["SharePoint no carga", "No puedo abrir un archivo en SharePoint", "SharePoint muestra un error"],
    excel: ["Excel no abre", "Excel muestra un error al abrir el archivo", "No puedo guardar un archivo de Excel"],
    word: ["Word no abre", "Word muestra un error", "No puedo guardar un documento de Word"]
};

function normalizeTitle(text) {
    return String(text || "").toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim();
}

function getUnknownSoftwareSuggestions(text) {
    const cleanText = String(text || "").trim().replace(/[.!?]+$/, "");
    if (!cleanText) return [];
    const subject = cleanText.replace(/^(problema con|error en|falla|fallo|no funciona|no abre)\s+/i, "").trim();
    if (!subject) return [];
    return [
        `${subject}: no abre o no inicia correctamente`,
        `${subject}: muestra un error al utilizarlo`,
        `${subject}: dejó de funcionar o responde lentamente`,
        `No puedo completar una tarea en ${subject}`
    ];
}

function getLocalSuggestions(text) {
    const normalized = normalizeTitle(text);
    const matches = [...new Set(Object.entries(LOCAL_PROBLEM_SUGGESTIONS)
        .filter(([keyword]) => normalized.includes(keyword))
        .flatMap(([, suggestions]) => suggestions))];
    if (matches.length < 5 && (normalized.length >= 4 || /programa|aplicacion|software|sistema|plataforma|modulo|app|no abre|error|falla|fallo|no funciona|no inicia|lento/.test(normalized))) {
        matches.push(...getUnknownSoftwareSuggestions(text));
    }
    return [...new Set(matches)].slice(0, 5);
}

function getLocalCategory(text) {
    const normalized = String(text || "").toLowerCase();
    if (/teclado|mouse|pantalla|monitor|computador|computadora/.test(normalized)) return "hardware";
    if (/internet|wifi|wi-fi|red|conexión|conexion/.test(normalized)) return "red_internet";
    if (/correo|outlook|email|e-mail/.test(normalized)) return "correo";
    if (/impresora|imprimir|impresión|impresion|toner|tonner/.test(normalized)) return "impresora";
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
    const imageInput = form.querySelector("#ticketImages");
    const imagePreview = form.querySelector("#ticketImagePreview");
    const defaultDescriptionPlaceholder = description?.getAttribute("placeholder") || "Describe el problema con el mayor detalle posible...";
    if (description) description.dataset.defaultPlaceholder = defaultDescriptionPlaceholder;
    const titleCount = form.querySelector("#titleCount");
    const descriptionCount = form.querySelector("#descriptionCount");
    const updateCount = (field, counter) => {
        if (field && counter) counter.textContent = String(field.value.length);
    };
    [[title, titleCount], [description, descriptionCount]].forEach(([field, counter]) => {
        field?.addEventListener("input", () => {
            updateCount(field, counter);
            clearFieldError(field);
        });
        updateCount(field, counter);
    });
    form.querySelector("#office")?.addEventListener("change", (event) => clearFieldError(event.currentTarget));
    form.querySelector("#anydesk_code")?.addEventListener("input", (event) => clearFieldError(event.currentTarget));

    imageInput?.addEventListener("change", () => {
        const files = Array.from(imageInput.files || []);
        if (files.length > 5 || files.some(file => !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024)) {
            imageInput.value = "";
            if (imagePreview) imagePreview.replaceChildren();
            alert("Puedes adjuntar máximo 5 imágenes de hasta 10 MB cada una.");
            return;
        }
        if (!imagePreview) return;
        imagePreview.replaceChildren();
        files.forEach(file => {
            const item = document.createElement("span");
            item.className = "ticket-image-chip";
            const icon = document.createElement("i");
            icon.className = "bi bi-image";
            const name = document.createElement("span");
            name.textContent = file.name;
            item.append(icon, name);
            imagePreview.appendChild(item);
        });
    });

    const suggestionsPanel = form.querySelector("#problemSuggestions");
    const suggestionsList = form.querySelector("#problemSuggestionsList");
    const suggestionCache = new Map();
    let lastSuggestionQuery = "";
    let suggestionTimer;
    let suggestionController;
    const renderSuggestions = (suggestions = []) => {
        if (!suggestionsPanel || !suggestionsList) return;
        suggestionsList.replaceChildren();
        suggestions.slice(0, 8).forEach((suggestion) => {
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
            if (text.length < 4) {
                lastSuggestionQuery = "";
                return renderSuggestions([]);
            }
            const cacheKey = text.toLowerCase().replace(/\s+/g, " ").trim();
            if (cacheKey === lastSuggestionQuery) return;
            lastSuggestionQuery = cacheKey;
            const fallbackSuggestions = getLocalSuggestions(text);
            const fallbackCategory = getLocalCategory(text);
            // Mostrar una respuesta inmediata para que un nombre de programa
            // desconocido nunca deje el formulario en estado de espera.
            renderSuggestions(fallbackSuggestions);
            if (suggestionsPanel) suggestionsPanel.hidden = false;
            const heading = suggestionsPanel?.querySelector(".suggestions-heading span");
            if (heading) heading.textContent = fallbackSuggestions.length ? "Sugerencias disponibles" : "Analizando título...";
            const descriptionSuggestion = form.querySelector("#descriptionSuggestion");
            const descriptionSuggestionText = form.querySelector("#descriptionSuggestionText");
            if (descriptionSuggestion) descriptionSuggestion.hidden = true;
            const category = form.querySelector("#category");
            const categoryValue = form.querySelector("#categoryValue");
            suggestionController?.abort();
            suggestionController = new AbortController();
            try {
                let result = suggestionCache.get(cacheKey);
                if (!result) {
                    let timeoutId;
                    const suggestionTimeout = new Promise((_, reject) => {
                        timeoutId = setTimeout(() => {
                            const error = new Error("La IA tardó demasiado en responder.");
                            error.name = "SuggestionTimeoutError";
                            reject(error);
                        }, 6000);
                        suggestionController.signal.addEventListener("abort", () => clearTimeout(timeoutId), { once: true });
                    });
                    try {
                        result = await Promise.race([
                            api.post("/tickets/suggestions", { text }, { signal: suggestionController.signal }),
                            suggestionTimeout
                        ]);
                    } finally {
                        clearTimeout(timeoutId);
                    }
                    suggestionCache.set(cacheKey, result);
                }
                renderSuggestions(result.suggestions || []);
                if (heading) heading.textContent = "Sugerencias disponibles";
                if (descriptionSuggestionText && result.descriptionSuggestion) {
                    descriptionSuggestionText.textContent = result.descriptionSuggestion;
                    if (descriptionSuggestion) descriptionSuggestion.hidden = false;
                }
                if (description && result.descriptionSuggestion) {
                    description.placeholder = `Ej: ${result.descriptionSuggestion}`;
                }
                if (category && result.category) category.value = result.category;
                if (categoryValue && result.category) categoryValue.value = result.category;
            } catch (error) {
                if (error.name !== "AbortError") {
                    renderSuggestions(fallbackSuggestions);
                    if (heading) heading.textContent = fallbackSuggestions.length ? "Sugerencias disponibles" : "Completa el título para sugerir problemas";
                    if (descriptionSuggestionText) {
                        descriptionSuggestionText.textContent = `Describe qué ocurre con “${text}”, desde cuándo sucede, a quién afecta y qué intentaste.`;
                        if (descriptionSuggestion) descriptionSuggestion.hidden = false;
                    }
                    if (description) {
                        description.placeholder = `Ej: Describe qué ocurre con “${text}”, desde cuándo sucede y qué intentaste.`;
                    }
                    if (category && fallbackCategory) category.value = fallbackCategory;
                    if (categoryValue && fallbackCategory) categoryValue.value = fallbackCategory;
                    console.warn("Sugerencias no disponibles:", error.message);
                }
            }
        }, 850);
    };
    title?.addEventListener("input", loadSuggestions);

    setupVoiceInputs(form, title, description);

}

function clearFieldError(field) {
    if (!field) return;
    field.classList.remove("field-invalid");
    field.removeAttribute("aria-invalid");
    field.parentElement?.querySelector(".field-validation-error")?.remove();
}

function showFieldError(field, message) {
    if (!field) return;
    clearFieldError(field);
    field.classList.add("field-invalid");
    field.setAttribute("aria-invalid", "true");
    const error = document.createElement("small");
    error.className = "field-validation-error";
    error.setAttribute("role", "alert");
    error.innerHTML = `<i class="bi bi-exclamation-circle-fill"></i><span>${message}</span>`;
    field.parentElement?.appendChild(error);
}

function validateTicketForm(form, data) {
    const fields = ["title", "description", "office", "anydesk_code"]
        .map(id => form.querySelector(`#${id}`));
    fields.forEach(clearFieldError);
    const errors = [];
    const title = form.querySelector("#title");
    const description = form.querySelector("#description");
    const office = form.querySelector("#office");
    const anydesk = form.querySelector("#anydesk_code");

    if (!data.title) {
        errors.push([title, "Escribe un título para identificar el problema."]);
    } else if (data.title.length < 5) {
        errors.push([title, "El título debe tener al menos 5 caracteres."]);
    }
    if (!data.description) {
        errors.push([description, "Describe qué ocurrió para que podamos ayudarte."]);
    } else if (data.description.length < 20) {
        errors.push([description, "Agrega un poco más de detalle (mínimo 20 caracteres)."]);
    }
    const hasOfficeOptions = office && Array.from(office.options).some(option => option.value);
    if (hasOfficeOptions && !data.office) {
        errors.push([office, "Selecciona la oficina donde necesitas atención."]);
    }
    if (data.is_remote && !data.anydesk_code) {
        errors.push([anydesk, "Escribe el código AnyDesk para solicitar atención remota."]);
    }
    errors.forEach(([field, message]) => showFieldError(field, message));
    if (errors.length) {
        errors[0][0]?.focus({ preventScroll: false });
        alert(errors.length === 1 ? errors[0][1] : `Revisa ${errors.length} campos marcados para continuar.`);
        return false;
    }
    return true;
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
    const description = form.querySelector("#description");
    const imageInput = form.querySelector("#ticketImages");
    const imagePreview = form.querySelector("#ticketImagePreview");
    const defaultDescriptionPlaceholder = description?.dataset.defaultPlaceholder
        || description?.getAttribute("placeholder")
        || "Escribe un título y la IA te mostrará un ejemplo para completar la descripción...";

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

    if (!validateTicketForm(form, data)) {
        btn.disabled=false;
        btn.innerText="Crear Ticket";
        if (submitStatus) submitStatus.textContent = "";
        return;
    }

    let createdTicketId = null;
    try{

        const response = await createTicket(data);
        const ticket = response?.ticket;
        if (!ticket?.id) throw new Error("El ticket se creó sin un identificador válido.");
        createdTicketId = ticket.id;

        const images = Array.from(imageInput?.files || []);
        if (images.length) {
            if (submitStatus) submitStatus.textContent = "Guardando imágenes...";
            for (const image of images) {
                await uploadTicketFile(ticket.id, image);
            }
        }

        const priority = ticket.priority || "media";
        const sla = ticket.sla_hours ? `${ticket.sla_hours} h` : "24 h";
        alert(`✅ Ticket #${ticket.id} creado correctamente${images.length ? ` con ${images.length} imagen${images.length === 1 ? "" : "es"} adjunta${images.length === 1 ? "" : "s"}` : ""}. Prioridad: ${priority.toUpperCase()} · SLA: ${sla}`);

        form.reset();
        if (imagePreview) imagePreview.replaceChildren();
        if (description) description.placeholder = defaultDescriptionPlaceholder;

        const category = form.querySelector("#category");
        const categoryValue = form.querySelector("#categoryValue");
        if (category) category.value = "otro";
        if (categoryValue) categoryValue.value = "otro";

        const remoteSection = form.querySelector("#remoteSection");
        if (remoteSection) remoteSection.style.display="none";

    }catch(err){

        console.error(err);

        alert(createdTicketId
            ? `El ticket #${createdTicketId} se creó, pero no se pudieron guardar las imágenes. Puedes adjuntarlas desde el detalle del ticket.`
            : (err.message || "No fue posible crear el ticket."));

    }

    btn.disabled=false;

    btn.innerText="Crear Ticket";
    if (submitStatus) submitStatus.textContent = "";

}

init();
