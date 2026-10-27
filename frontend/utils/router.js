import { Storage } from "./storage.js";

export function requireAuth() {

    const token = Storage.getToken();

    if (!token) {

        goTo("/pages/auth/login.html");

        return false;

    }

    return true;

}

export function requireGuest() {

    const token = Storage.getToken();

    if (token) {

        goTo("/pages/dashboard/dashboard.html");

        return false;

    }

    return true;

}

export function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    goTo("/pages/auth/login.html");

}

export function goTo(path) {
    if (document.body && !document.querySelector(".navigation-skeleton")) {
        document.body.insertAdjacentHTML("beforeend", `
            <div class="navigation-skeleton" aria-live="polite" aria-label="Cargando sección">
                <aside class="skeleton-sidebar">
                    <div class="skeleton-user skeleton-row"><span class="skeleton-avatar skeleton-block"></span><span class="skeleton-lines"><i class="skeleton-block"></i><i class="skeleton-block"></i></span></div>
                    <div class="skeleton-menu"><i class="skeleton-block"></i><i class="skeleton-block"></i><i class="skeleton-block"></i><i class="skeleton-block"></i><i class="skeleton-block"></i></div>
                </aside>
                <main class="skeleton-main">
                    <div class="skeleton-header skeleton-row"><span class="skeleton-block skeleton-title"></span><span class="skeleton-block skeleton-profile"></span></div>
                    <div class="skeleton-content">
                        <span class="skeleton-block skeleton-heading"></span>
                        <div class="skeleton-cards"><i class="skeleton-block"></i><i class="skeleton-block"></i><i class="skeleton-block"></i></div>
                        <div class="skeleton-panel skeleton-block"></div>
                        <div class="skeleton-panel skeleton-block short"></div>
                    </div>
                </main>
            </div>
        `);
    }
    window.setTimeout(() => {
        window.location.href = path;
    }, 420);

}
