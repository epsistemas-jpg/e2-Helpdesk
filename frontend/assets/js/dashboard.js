import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { DashboardPage } from "../../pages/dashboard/DashboardPage.js";
import { Storage } from "../../utils/storage.js";
import { goTo } from "../../utils/router.js";

requireAuth();

async function init() {

    try {
        const page = await DashboardPage();

        renderLayout({
            title: "Dashboard",
            active: "dashboard",
            content: page
        });
    } catch (error) {
        console.error("No se pudo cargar el dashboard:", error);

        if (error.status === 401 || error.status === 403) {
            Storage.logout();
            goTo("/pages/auth/login.html#google_error=La sesión expiró. Vuelve a iniciar sesión.");
            return;
        }

        renderLayout({
            title: "Dashboard",
            active: "dashboard",
            content: `
                <section class="card" style="padding:2rem; text-align:center;">
                    <i class="bi bi-exclamation-triangle" style="font-size:2rem; color:#d79b00;"></i>
                    <h2>No pudimos cargar tu información</h2>
                    <p>${error.message || "Intenta nuevamente en unos segundos."}</p>
                    <button class="btn-primary" type="button" onclick="location.reload()">Reintentar</button>
                </section>
            `
        });
    }

}

init();
