import { requireAuth } from "../../utils/router.js";
import { renderLayout } from "../../layouts/MainLayout.js";
import { getUsers, updateUser, createUser } from "../../services/userService.js";
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

                <div class="users-section-header">
                    <div>
                        <span class="section-kicker">ADMINISTRACIÓN</span>
                        <h3>Usuarios del sistema</h3>
                        <p>Administra los roles y el acceso de cada cuenta.</p>
                    </div>
                    <button id="addUserBtn" class="users-add-button" type="button">
                        <i class="bi bi-person-plus-fill"></i>
                        <span>Agregar usuario</span>
                    </button>
                </div>

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

                                <td class="user-email">${user.email}</td>

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

                                    <a
                                        class="btn-secondary history-user"
                                        href="/pages/tickets/tickets.html?user_id=${user.id}&user_name=${encodeURIComponent(user.name || user.email)}"
                                    >
                                        <i class="bi bi-clock-history"></i>
                                        Historial
                                    </a>

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

    const addUserBtn = document.querySelector("#addUserBtn");
    if (addUserBtn) addUserBtn.addEventListener("click", async () => {
        const { value: form } = await Swal.fire({
            title: "Agregar usuario",
            html: `
                <input id="newUserName" class="swal2-input" placeholder="Nombre completo">
                <input id="newUserEmail" class="swal2-input" type="email" placeholder="correo@e2energiaeficiente.com">
                <input id="newUserOffice" class="swal2-input" placeholder="Oficina">
                <select id="newUserRole" class="swal2-select">
                    <option value="employee">Empleado</option>
                    <option value="support">Soporte</option>
                    <option value="admin">Administrador</option>
                </select>
                <p class="user-modal-help"><i class="bi bi-info-circle"></i> El usuario ingresará con Google corporativo.</p>
            `,
            showCancelButton: true,
            confirmButtonText: "Crear usuario",
            cancelButtonText: "Cancelar",
            focusConfirm: false,
            preConfirm: () => {
                const name = document.querySelector("#newUserName")?.value.trim();
                const email = document.querySelector("#newUserEmail")?.value.trim();
                const office = document.querySelector("#newUserOffice")?.value.trim();
                const role = document.querySelector("#newUserRole")?.value;
                if (!name || !email || !office) {
                    Swal.showValidationMessage("Completa nombre, correo y oficina.");
                    return false;
                }
                return { name, email, office, role };
            }
        });
        if (!form) return;
        try {
            await createUser(form);
            await Swal.fire({ icon: "success", title: "Usuario creado", text: "Ya puede ingresar con Google corporativo.", timer: 1500, showConfirmButton: false });
            await renderUsers();
        } catch (error) {
            Swal.fire({ icon: "error", title: "No fue posible crear el usuario", text: error.message });
        }
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
