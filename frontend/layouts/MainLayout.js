import { Sidebar } from "../components/sidebar.js";
import { Header } from "../components/header.js";
import { Storage } from "../utils/storage.js";
import { logout } from "../utils/router.js";
import { AssistantChat } from "../components/assistant/AssistantChat.js";
import { initAssistantChat } from "../assets/js/assistantChat.js";

export function renderLayout({

    title,

    active,

    content

}) {

    const user = Storage.getUser();
    document.body.innerHTML = `

<div class="app">

    ${Sidebar(active)}

    <div class="main">

        ${Header(title, user)}

        <div class="content">

            <div id="page-content">

                ${content}

            </div>

        </div>

    </div>

</div>

${AssistantChat()}

`;

    initLayoutEvents();

}

function initLayoutEvents() {

    const logoutBtn = document.querySelector("#logoutBtn");
    const headerUser = document.querySelector(".header-user");
    const headerMenu = document.querySelector("#headerUserMenu");
    const headerDropdown = document.querySelector("#headerUserDropdown");
    const headerLogoutBtn = document.querySelector("#headerLogoutBtn");

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (headerMenu && headerDropdown) {
        const closeHeaderMenu = () => {
            headerMenu.setAttribute("aria-expanded", "false");
            headerDropdown.setAttribute("aria-hidden", "true");
            headerDropdown.classList.remove("is-open");
        };
        headerMenu.addEventListener("click", event => {
            event.stopPropagation();
            const isOpen = headerDropdown.classList.toggle("is-open");
            headerMenu.setAttribute("aria-expanded", String(isOpen));
            headerDropdown.setAttribute("aria-hidden", String(!isOpen));
        });
        headerDropdown.addEventListener("click", event => event.stopPropagation());
        document.addEventListener("click", event => {
            if (headerUser && !headerUser.contains(event.target)) closeHeaderMenu();
        });
    }
    if (headerLogoutBtn) headerLogoutBtn.addEventListener("click", logout);
    initAssistantChat();

    if (!window.__helpdeskContextMenuBlocked) {
        document.addEventListener("contextmenu", event => event.preventDefault());
        window.__helpdeskContextMenuBlocked = true;
    }

}
