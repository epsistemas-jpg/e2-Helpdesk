export function Header(title,user){

    const escapeHtml = value => String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
    const safeName = escapeHtml(user?.name || "Usuario");
    const safeRole = escapeHtml(user?.role || "employee");
    const safeTitle = escapeHtml(title || "Helpdesk");
    const isTicketTitle = /^Ticket\s+#/i.test(String(title || ""));

    return `

<header class="header">

    <div class="header-heading">
        <h2 class="header-title${isTicketTitle ? " header-title-ticket" : ""}">${safeTitle}</h2>
    </div>

    <div class="header-user">

        <button id="headerUserMenu" class="user-box" type="button" aria-expanded="false" aria-controls="headerUserDropdown" aria-label="Abrir menú de usuario">

            <div>

                <strong>${safeName}</strong><br>

                <small class="role-badge">${safeRole}</small>

            </div>

            <div class="user-avatar">

                ${escapeHtml((user?.name || "U").charAt(0))}

            </div>

        </button>

        <div id="headerUserDropdown" class="header-user-dropdown" aria-hidden="true">
            <div class="header-user-summary">
                <strong>${safeName}</strong>
                <small>${safeRole}</small>
            </div>
            <button id="headerLogoutBtn" type="button" class="header-logout-btn">
                <svg class="header-logout-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M10 4H5.8A1.8 1.8 0 0 0 4 5.8v12.4A1.8 1.8 0 0 0 5.8 20H10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
                    <path d="M13 8l4 4-4 4M8 12h9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Cerrar sesión</span>
            </button>
        </div>

    </div>

</header>

`;

}
