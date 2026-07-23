export function Header(title,user){

    return `

<header class="header">

    <h2 class="header-title">

        ${title}

    </h2>

    <div class="user-box">

        <div>

            <strong>${user.name}</strong><br>

            <small>${user.role}</small>

        </div>

        <div class="user-avatar">

            ${user.name.charAt(0)}

        </div>

    </div>

</header>

`;

}