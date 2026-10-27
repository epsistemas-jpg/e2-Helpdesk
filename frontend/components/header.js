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
                <i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                <span>Cerrar sesión</span>
            </button>

        </div>

    </div>

</header>

`;

}
