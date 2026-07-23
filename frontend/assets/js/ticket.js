import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { TicketsPage } from "../../pages/tickets/TicketsPage.js";
import { enableTableSearch } from "../../utils/TableSearch.js";

requireAuth();

async function init() {

    const html = await TicketsPage();

    renderLayout({

        title: "Tickets",

        active: "tickets",

        content: html

    });

    // Buscador
    enableTableSearch(
        "tableSearch",
        "table"
    );

    // Abrir detalle del ticket
    document.querySelectorAll(".view-ticket").forEach(btn => {

        btn.addEventListener("click", () => {

            window.location.href =
                `../../pages/tickets/ticketDetails.html?id=${btn.dataset.id}`;

        });

    });

}

init();