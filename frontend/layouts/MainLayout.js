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
    const headerLogoutBtn = document.querySelector("#headerLogoutBtn");

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (headerLogoutBtn) headerLogoutBtn.addEventListener("click", logout);
    initAssistantChat();

    if (!window.__helpdeskContextMenuBlocked) {
        document.addEventListener("contextmenu", event => event.preventDefault());
        window.__helpdeskContextMenuBlocked = true;
    }

}
