import { Sidebar } from "../components/sidebar.js";
import { Header } from "../components/header.js";
import { Storage } from "../utils/storage.js";
import { logout } from "../utils/router.js";

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

`;

    initLayoutEvents();

}

function initLayoutEvents() {

    const logoutBtn = document.querySelector("#logoutBtn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", logout);

}
