import { Storage } from "../utils/storage.js";
import { goTo } from "../utils/router.js";

export function Sidebar(active) {

    const user = Storage.getUser() || {};

    const role = user.role || "employee";

    const menu = [

        {
            id: "dashboard",
            title: "Dashboard",
            icon: "bi-grid-1x2-fill",
            page: "/pages/dashboard/dashboard.html",
            roles: ["employee", "support", "admin"]
        },

        {
            id: "create-ticket",
            title: "Crear Ticket",
            icon: "bi-plus-circle-fill",
            page: "/pages/tickets/createTicket.html",
            roles: ["employee", "support", "admin"]

        },

        {
            id: "tickets",
            title: role === "employee" ? "Mi historial" : "Tickets",
            icon: "bi-ticket-perforated-fill",
            page: "/pages/tickets/tickets.html",
            roles: ["employee", "support", "admin"]
        },

        {
            id: "reports",
            title: "Reportes",
            icon: "bi-bar-chart-fill",
            page: "/pages/reports/reports.html",
            roles: ["support", "admin"]
        },

        {
            id: "users",
            title: "Usuarios",
            icon: "bi-people-fill",
            page: "/pages/users/users.html",
            roles: ["admin"]
        },

        {
            id: "settings",
            title: "Configuración",
            icon: "bi-gear-fill",
            page: "/pages/settings/settings.html",
            roles: ["admin"]
        }

    ];

    const items = menu
        .filter(item => item.roles.includes(role))
        .map(item => `
            <div
                class="sidebar-item ${active === item.id ? "active" : ""}"
                data-page="${item.page}"
            >

                <i class="bi ${item.icon}"></i>

                <span>${item.title}</span>

            </div>
        `)
        .join("");

    setTimeout(initSidebarEvents, 0);

    return `

        <aside class="sidebar">

            <button id="sidebarToggle" class="sidebar-toggle" type="button" aria-label="Recoger menú" title="Recoger menú">
                <i class="bi bi-chevron-left"></i>
            </button>

            <div class="sidebar-user">

                <div class="avatar">
                    ${user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>

                <div class="sidebar-user-copy">
                    <strong>${user.name || "Usuario"}</strong>
                    <p>${role.toUpperCase()}</p>
                </div>

                

            </div>

            <nav class="sidebar-menu">

                ${items}

            </nav>

            <div class="sidebar-footer">

                <button id="logoutBtn">

                    <i class="bi bi-box-arrow-right"></i>

                    Cerrar sesión

                </button>

                <small>

                    E2 HelpDesk v1.0

                </small>

            </div>

        </aside>

    `;

}

function initSidebarEvents() {

    const sidebar = document.querySelector(".sidebar");
    const toggle = document.querySelector("#sidebarToggle");
    const collapsed = localStorage.getItem("helpdesk.sidebarCollapsed") === "true";

    const setCollapsed = (value) => {
        sidebar?.classList.toggle("collapsed", value);
        if (toggle) {
            toggle.setAttribute("aria-label", value ? "Expandir menú" : "Recoger menú");
            toggle.title = value ? "Expandir menú" : "Recoger menú";
            toggle.innerHTML = `<i class="bi bi-chevron-${value ? "right" : "left"}"></i>`;
        }
        localStorage.setItem("helpdesk.sidebarCollapsed", String(value));
    };

    setCollapsed(collapsed);
    toggle?.addEventListener("click", () => setCollapsed(!sidebar?.classList.contains("collapsed")));

    document.querySelectorAll(".sidebar-item").forEach(item => {

        item.onclick = () => {

            goTo(item.dataset.page);

        };

    });

}
