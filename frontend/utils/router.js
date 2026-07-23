import { Storage } from "./storage.js";

export function requireAuth() {

    const token = Storage.getToken();

    if (!token) {

        goTo("/pages/auth/login.html");

        return false;

    }

    return true;

}

export function requireGuest() {

    const token = Storage.getToken();

    if (token) {

        goTo("/pages/dashboard/dashboard.html");

        return false;

    }

    return true;

}

export function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    goTo("/pages/auth/login.html");

}

export function goTo(path) {

    window.location.href = `${window.location.origin}/frontend${path}`;

}