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
            title: "Tickets",
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

            <div class="sidebar-user">

                <div class="avatar">

                    ${user.name ? user.name.charAt(0).toUpperCase() : "U"}

                </div>

                

                <p>${role.toUpperCase()}</p>

                

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

    document.querySelectorAll(".sidebar-item").forEach(item => {

        item.onclick = () => {

            goTo(item.dataset.page);

        };

    });

}
