import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { getUsers, updateUser } from "../../services/userService.js";
import { Storage } from "../../utils/storage.js";

if (requireAuth()) {
    init();
}

async function init() {

    const user = Storage.getUser() || {};

    if (user.role !== "admin") return;

    try {

        await renderUsers();

    } catch (error) {

        renderLayout({
            title: "Usuarios",
            active: "users",
            content: `
                <div class="section">
                    <h3>Error cargando usuarios</h3>
                    <p>${error.message}</p>
                </div>
            `
        });

    }

}

async function renderUsers() {

    const { users } = await getUsers();

    renderLayout({

        title: "Usuarios",

        active: "users",

        content: `
            <div class="section">

                <h3>Usuarios del sistema</h3>

                <br>

                <p>Administra los roles y el acceso de cada cuenta.</p>

                <br>

                <table class="ticket-table">

                    <thead>

                        <tr>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Oficina</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acción</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${users.map(user => `

                            <tr>

                                <td>${user.name}</td>

                                <td>${user.email}</td>

                                <td>${user.office || "-"}</td>

                                <td>

                                    <select
                                        class="role-select"
                                        data-id="${user.id}"
                                    >

                                        <option value="employee"
                                            ${user.role === "employee" ? "selected" : ""}>
                                            Empleado
                                        </option>

                                        <option value="support"
                                            ${user.role === "support" ? "selected" : ""}>
                                            Soporte
                                        </option>

                                        <option value="admin"
                                            ${user.role === "admin" ? "selected" : ""}>
                                            Administrador
                                        </option>

                                    </select>

                                </td>

                                <td>

                                    <span class="${user.active ? "status-open" : "status-closed"}">

                                        ${user.active ? "Activo" : "Inactivo"}

                                    </span>

                                </td>

                                <td>

                                    <button
                                        class="btn-secondary toggle-user"
                                        data-id="${user.id}"
                                        data-active="${user.active ? 1 : 0}"
                                    >

                                        ${user.active ? "Desactivar" : "Activar"}

                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `

    });

    document.querySelectorAll(".role-select").forEach(select => {

        select.addEventListener("change", async (e) => {

            try {

                await updateUser(e.target.dataset.id, {
                    role: e.target.value
                });

                Swal.fire({
                    icon: "success",
                    title: "Rol actualizado",
                    timer: 1000,
                    showConfirmButton: false
                });

            } catch (error) {

                Swal.fire({
                    icon: "error",
                    title: error.message
                });

            }

        });

    });

    document.querySelectorAll(".toggle-user").forEach(button => {

        button.addEventListener("click", async (e) => {

            const btn = e.currentTarget;

            try {

                await updateUser(btn.dataset.id, {
                    active: btn.dataset.active !== "1"
                });

                await renderUsers();

            } catch (error) {

                Swal.fire({
                    icon: "error",
                    title: error.message
                });

            }

        });

    });

}