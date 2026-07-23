import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import api from "../../services/api.js";
import { Storage } from "../../utils/storage.js";

if (requireAuth()) {
    init();
}

async function init() {

    const user = Storage.getUser() || {};

    if (user.role !== "admin") return;

    renderLayout({
        title: "Configuración",
        active: "settings",
        content: `

<div class="settings-grid">

    <div class="ticket-card">

        <h3>
            <i class="bi bi-person-circle"></i>
            Perfil
        </h3>

        <form id="profileForm">

            <div class="ticket-grid">

                <label>

                    Nombre

                    <input
                        type="text"
                        name="name"
                        value="${user.name || ""}"
                        required
                    >

                </label>

                <label>

                    Oficina

                    <input
                        type="text"
                        name="office"
                        value="${user.office || ""}"
                        required
                    >

                </label>

            </div>

            <button class="view-ticket" type="submit">

                <i class="bi bi-check-circle"></i>

                Guardar cambios

            </button>

        </form>

    </div>



    <div class="ticket-card">

        <h3>

            <i class="bi bi-shield-lock"></i>

            Seguridad

        </h3>

        <form id="passwordForm">

            <div class="ticket-grid">

                <label>

                    Contraseña actual

                    <input
                        type="password"
                        name="currentPassword"
                        required
                    >

                </label>

                <label>

                    Nueva contraseña

                    <input
                        type="password"
                        name="newPassword"
                        minlength="8"
                        required
                    >

                </label>

            </div>

            <button class="view-ticket" type="submit">

                <i class="bi bi-key"></i>

                Actualizar contraseña

            </button>

        </form>

    </div>



    

</div>

`
    });

    document
        .querySelector("#profileForm")
        .addEventListener("submit", saveProfile);

    document
        .querySelector("#passwordForm")
        .addEventListener("submit", savePassword);

}

async function saveProfile(event) {

    event.preventDefault();

    const data = Object.fromEntries(
        new FormData(event.target)
    );

    try {

        const result = await api.patch(
            "/auth/profile",
            data
        );

        Storage.setUser(result.user);

        Swal.fire({
            icon: "success",
            title: "Perfil actualizado",
            timer: 1200,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: error.message
        });

    }

}

async function savePassword(event) {

    event.preventDefault();

    const data = Object.fromEntries(
        new FormData(event.target)
    );

    try {

        await api.patch(
            "/auth/password",
            data
        );

        event.target.reset();

        Swal.fire({
            icon: "success",
            title: "Contraseña actualizada",
            timer: 1200,
            showConfirmButton: false
        });

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: error.message
        });

    }

}