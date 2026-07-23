// public/js/login.js
import TubesCursor from
    "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js";
import { login, verifyOtp, register } from "../../services/authService.js";
import { Storage } from "../../utils/storage.js";
import { requireGuest } from "../../utils/router.js";

requireGuest();

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const goLogin = document.getElementById("goLogin");
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

const forgotPasswordModal = document.getElementById("forgotPasswordModal");

const closeResetModal = document.getElementById("closeResetModal");

const sendResetBtn = document.getElementById("sendResetBtn");

const resetEmail = document.getElementById("resetEmail");
const otpModal = document.getElementById("otpModal");
const otpForm = document.getElementById("otpForm");
const otpCode = document.getElementById("otpCode");
const otpError = document.getElementById("otpError");
const otpCancel = document.getElementById("otpCancel");
const authLoader = document.getElementById("authLoader");
const loaderText = document.getElementById("loaderText");

function setLoading(active, text = "Procesando...") {
    authLoader.classList.toggle("active", active);
    authLoader.setAttribute("aria-hidden", String(!active));
    loaderText.textContent = text;
    document.querySelectorAll("#loginForm button, #registerForm button").forEach(button => { button.disabled = active; });
}

function showOtpModal() {
    otpError.textContent = "";
    otpCode.value = "";
    otpModal.classList.add("active");
    setTimeout(() => otpCode.focus(), 0);
}

function hideOtpModal() {
    otpModal.classList.remove("active");
    otpCode.value = "";
}

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;
if (loginForm) {
    loginForm.querySelector('[name="email"]').maxLength = 254;
    loginForm.querySelector('[name="password"]').maxLength = 64;
}
if (registerForm) {
    registerForm.querySelector('[name="name"]').maxLength = 100;
    registerForm.querySelector('[name="email"]').maxLength = 254;
    const registerPassword = registerForm.querySelector('[name="password"]');
    registerPassword.minLength = 8;
    registerPassword.maxLength = 64;
    registerPassword.title = "Usa 8-64 caracteres, mayúscula, minúscula, número y símbolo.";
}
/* =========================
   FONDO ANIMADO
========================= */

const canvas = document.getElementById("canvas");

if (canvas) {

    TubesCursor(canvas, {

        tubes: {

            colors: [
                "#c2d500",
                "#9db100",
                "#d4ea1c"
            ],

            lights: {

                intensity: 200,

                colors: [
                    "#c2d500",
                    "#d4ea1c",
                    "#8ea300",
                    "#ffffff"
                ]
            }
        }
    });
}

/* =========================
   LIMPIAR FORMULARIOS
========================= */

function clearForms() {

    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

}

/* =========================
   CAMBIO DE TABS
========================= */

loginTab.addEventListener("click", () => {

    clearForms();

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    loginForm.classList.add("active");
    registerForm.classList.remove("active");

});

registerTab.addEventListener("click", () => {

    clearForms();

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    registerForm.classList.add("active");
    loginForm.classList.remove("active");

});

/* =========================
   LINK VOLVER A LOGIN
========================= */

if (goLogin) {

    goLogin.addEventListener("click", (e) => {

        e.preventDefault();

        loginTab.classList.add("active");
        registerTab.classList.remove("active");

        loginForm.classList.add("active");
        registerForm.classList.remove("active");

        clearForms();

    });

}

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(loginForm);
    const credentials = Object.fromEntries(formData);
    if (credentials.email.length > 254 || credentials.password.length > 64) {
        alert("El correo o la contraseña superan el límite permitido.");
        return;
    }

    try {

        setLoading(true, "Comprobando credenciales...");
        const result = await login(credentials);
        if (result.requiresOtp) {
            window.__otpChallengeId = result.challengeId;
            setLoading(false);
            showOtpModal();
            return;
        }
        window.location.href = "../dashboard/dashboard.html";

    } catch (error) {

        setLoading(false);
        alert(error.message);

    }

});

otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = otpCode.value.trim();
    if (!/^\d{6}$/.test(code)) {
        otpError.textContent = "Escribe un código válido de 6 dígitos.";
        return;
    }
    setLoading(true, "Validando código...");
    try {
        await verifyOtp(window.__otpChallengeId, code);
        hideOtpModal();
        window.location.href = "../dashboard/dashboard.html";
    } catch (error) {
        setLoading(false);
        otpError.textContent = error.message;
    }
});

otpCancel.addEventListener("click", () => {
    hideOtpModal();
    window.__otpChallengeId = null;
});

/* =========================
   REGISTRO
========================= */

registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const formData = new FormData(registerForm);

    const data = Object.fromEntries(formData);
    if (data.name.length > 100 || data.email.length > 254 || !passwordRule.test(data.password)) {
        alert("La contraseña debe tener 8-64 caracteres, mayúscula, minúscula, número y símbolo.");
        return;
    }

    try {

        setLoading(true, "Creando cuenta...");
        await register(data);

        alert("Cuenta creada correctamente");

        registerForm.reset();

        loginTab.click();

    } catch (error) {

        setLoading(false);
        alert(error.message);

    }

});
/* =========================
RECUPERAR CONTRASEÑA
========================= */

forgotPasswordLink.addEventListener("click", (e) => {

    e.preventDefault();

    resetEmail.value = "";

    forgotPasswordModal.classList.add("active");

});


closeResetModal.addEventListener("click", () => {

    forgotPasswordModal.classList.remove("active");

});


window.addEventListener("click", (e) => {

    if (e.target === forgotPasswordModal) {

        forgotPasswordModal.classList.remove("active");

    }

});


sendResetBtn.addEventListener("click", async () => {

    const email = resetEmail.value.trim();

    if (!email) {

        alert("Ingrese un correo.");

        return;

    }

    sendResetBtn.disabled = true;

    sendResetBtn.innerText = "Enviando...";

    try {

        const response = await fetch("/forgot-password", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ email })

        });

        const result = await response.json();

        alert(result.message);

        forgotPasswordModal.classList.remove("active");

    } catch (err) {

        console.error(err);

        alert("No fue posible enviar el correo.");

    }

    sendResetBtn.disabled = false;

    sendResetBtn.innerText = "Enviar enlace";

});
