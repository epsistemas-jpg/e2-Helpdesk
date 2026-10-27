export function Header(title,user){

    return `

<header class="header">

    <div class="header-heading">
        <h2 class="header-title">${title}</h2>
    </div>

    <div class="header-user">

        <button id="headerUserMenu" class="user-box" type="button" aria-expanded="false" aria-controls="headerUserDropdown" aria-label="Abrir menú de usuario">

            <div>

                <strong>${user.name}</strong><br>

                <small class="role-badge">${user.role}</small>

            </div>

            <div class="user-avatar">

                ${user.name.charAt(0)}

            </div>

        </button>

        <div id="headerUserDropdown" class="header-user-dropdown" hidden>

            <div class="header-user-summary">
                <strong>${user.name}</strong>
                <small>${user.role}</small>
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
