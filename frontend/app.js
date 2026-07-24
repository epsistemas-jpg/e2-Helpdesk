const path = window.location.pathname.replace(/\/+$/, "") || "/";

if (path === "/" || path === "/index.html") {
    window.location.replace(
        localStorage.getItem("token")
            ? "/pages/dashboard/dashboard.html"
            : "/pages/auth/login.html"
    );
}
