import CONFIG from "../config/config.js";
import { Storage } from "../utils/storage.js";

async function request(endpoint, options = {}) {

    const token = Storage.getToken();

    const headers = {

        "Content-Type": "application/json",

        ...(options.headers || {})

    };
    const trustedDevice = Storage.getTrustedDevice();

    if (trustedDevice) {
        headers["x-trusted-device"] = trustedDevice;
    }

    if (token) {

        headers.Authorization = `Bearer ${token}`;

    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let response;

    try {
        response = await fetch(
            `${CONFIG.API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
            {
                ...options,
                headers,
                signal: options.signal || controller.signal
            }
        );
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error("El servidor tardó demasiado en responder.");
        }
        throw new Error("No fue posible conectarse con el backend.");
    } finally {
        clearTimeout(timeout);
    }

    const data = response.status === 204 ? {} : await response.json();

    if (!response.ok) {

        throw new Error(data.error || "Error del servidor");

    }

    return data;

}

export default {

    get(endpoint) {

        return request(endpoint);

    },
    post(endpoint, data, options = {}) {

        return request(endpoint, {

            method: "POST",

            body: JSON.stringify(data),

            ...options

        });

    },

    put(endpoint, data) {

        return request(endpoint, {

            method: "PUT",

            body: JSON.stringify(data)

        });

    },
    patch(endpoint, data) {

        return request(endpoint, {

            method: "PATCH",

            body: JSON.stringify(data)

        });

    },

    delete(endpoint) {

        return request(endpoint, {

            method: "DELETE"

        });

    }

};
