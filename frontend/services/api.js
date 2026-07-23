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

    const response = await fetch(

        CONFIG.API_URL + endpoint,

        {

            ...options,

            headers

        }

    );

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
