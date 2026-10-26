import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { TicketsPage } from "../../pages/tickets/TicketsPage.js";
import { enableTableSearch } from "../../utils/TableSearch.js";
import { enableTicketFilters } from "../../utils/TicketFilters.js";
import { Storage } from "../../utils/storage.js";

requireAuth();

async function init() {

    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    const userName = params.get("user_name");
    const historyFilters = userId
        ? { user_id: userId, user_name: userName || "usuario" }
        : {};

    const html = await TicketsPage(historyFilters);
    const currentUser = Storage.getUser() || {};
    const pageTitle = userId
        ? "Historial de usuario"
        : currentUser.role === "employee"
            ? "Mi historial de tickets"
            : "Tickets";

    renderLayout({

        title: pageTitle,

        active: "tickets",

        content: html

    });

    // Buscador
    enableTableSearch(
        "tableSearch",
        "table"
    );
    enableTicketFilters();
    // Abrir detalle del ticket
    document.querySelectorAll(".view-ticket").forEach(btn => {

        btn.addEventListener("click", () => {

            window.location.href =
                `/pages/tickets/ticketDetails.html?id=${btn.dataset.id}`;

        });

    });

}

init();
