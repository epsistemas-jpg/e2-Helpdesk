import api from "./api.js";
import { Storage } from "../utils/storage.js";

export async function login(credentials){

    const response = await api.post(

        "/auth/login",

        credentials,

        {
            headers: {
                "x-trusted-device": Storage.getTrustedDevice() || ""
            }
        }

    );

    if (response.requiresOtp) return response;

    Storage.setToken(response.token);

    Storage.setUser(response.user);

    return response;

}

export async function verifyOtp(challengeId, code) {

    const response = await api.post("/auth/verify-otp", {
        challengeId,
        code
    });

    Storage.setToken(response.token);
    Storage.setUser(response.user);

    // NUEVO
    Storage.setTrustedDevice(response.trustedDevice);

    return response.user;
}

export async function register(data){

    return api.post(

        "/auth/register",

        data

    );

}

export async function currentUser(){

    return api.get("/auth/me");

}

export function logout(){

    Storage.logout();

    window.location.href="../auth/login.html";

}
