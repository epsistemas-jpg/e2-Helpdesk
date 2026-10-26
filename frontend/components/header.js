export function Header(title,user){

    return `

<header class="header">

    <div class="header-heading">
        <h2 class="header-title">${title}</h2>
    </div>

    <div class="user-box">

        <div>

            <strong>${user.name}</strong><br>

            <small class="role-badge">${user.role}</small>

        </div>

        <div class="user-avatar">

            ${user.name.charAt(0)}

        </div>

    </div>

</header>

`;

}
