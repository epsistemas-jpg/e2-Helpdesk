import { currentUser } from "../../services/authService.js";
import CONFIG from "../../config/config.js";
import { Storage } from "../../utils/storage.js";
import { requireGuest } from "../../utils/router.js";

const canvas = document.getElementById("canvas");
const authLoader = document.getElementById("authLoader");
const googleLoginButton = document.getElementById("googleLoginButton");

// La animación es decorativa: si la CDN no responde no debe bloquear el login.
if (canvas) {
    import("https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js")
        .then(({ default: TubesCursor }) => TubesCursor(canvas, {
            tubes: {
                colors: ["#c2d500", "#9db100", "#d4ea1c"],
                lights: { intensity: 200, colors: ["#c2d500", "#d4ea1c", "#8ea300", "#ffffff"] }
            }
        }))
        .catch(() => canvas.classList.add("animation-unavailable"));
}

function showLoader(active) {
    authLoader?.classList.toggle("active", active);
    authLoader?.setAttribute("aria-hidden", String(!active));
}

async function handleGoogleCallback() {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("google_token");
    const error = hash.get("google_error");
    if (error) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
        alert(error);
        return;
    }
    if (!token) return;

    try {
        showLoader(true);
        Storage.setToken(token);
        const response = await currentUser();
        Storage.setUser(response.user);
        history.replaceState(null, "", window.location.pathname + window.location.search);
        window.location.href = "/pages/dashboard/dashboard.html";
    } catch (error) {
        Storage.logout();
        showLoader(false);
        alert(error.message || "No fue posible completar el acceso con Google.");
    }
}

googleLoginButton?.addEventListener("click", () => {
    showLoader(true);
    window.location.href = `${CONFIG.API_URL}/auth/google`;
});

// El callback de Google puede llegar con un token antiguo guardado en el
// navegador. Primero procesamos el token nuevo; de lo contrario requireGuest
// podría redirigir al dashboard antes de completar el acceso actual.
const callbackHash = new URLSearchParams(window.location.hash.slice(1));
if (callbackHash.has("google_token") || callbackHash.has("google_error")) {
    handleGoogleCallback();
} else {
    requireGuest();
}
