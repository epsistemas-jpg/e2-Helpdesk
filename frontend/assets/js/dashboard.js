import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { DashboardPage } from "../../pages/dashboard/DashboardPage.js";

requireAuth();

async function init() {

    const page = await DashboardPage();

    renderLayout({

        title: "Dashboard",

        active: "dashboard",

        content: page

    });

}

init();