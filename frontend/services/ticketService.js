import api from "./api.js";
import CONFIG from "../config/config.js";
import { Storage } from "../utils/storage.js";

export async function createTicket(data) {

    return await api.post("/tickets", data);

}

export async function getTickets(filters = {}) {

    const params = new URLSearchParams();

    if (filters.search) {
        params.append("search", filters.search);
    }

    if (filters.status) {
        params.append("status", filters.status);
    }

    if (filters.priority) {
        params.append("priority", filters.priority);
    }

    if (filters.user_id) {
        params.append("user_id", filters.user_id);
    }

    const query = params.toString();

    return await api.get(
        `/tickets${query ? `?${query}` : ""}`
    );

}

export async function getTicket(id) {

    return await api.get(`/tickets/${id}`);

}

export async function updateTicketStatus(id, data) {

    return await api.patch(`/tickets/${id}/status`, data);

}
export async function takeTicket(id){

    return await api.patch(

        `/tickets/${id}/take`

    );

}
export async function changeTicketStatus(id, data) {

    return await api.patch(

        `/tickets/${id}/status`,

        data

    );

}

export async function addTicketComment(id, note) {
    return await api.post(`/tickets/${id}/comments`, { note });
}

export async function uploadTicketFile(id, file) {
    const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
    return await api.post(`/tickets/${id}/files`, {
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        data
    });
}

export async function openTicketFile(ticketId, fileId) {
    const response = await fetch(`${CONFIG.API_URL}/tickets/${encodeURIComponent(ticketId)}/files/${encodeURIComponent(fileId)}`, {
        headers: { Authorization: `Bearer ${Storage.getToken()}` }
    });
    if (!response.ok) {
        let message = "No fue posible abrir el archivo.";
        try { message = (await response.json()).error || message; } catch (_) { /* respuesta no JSON */ }
        throw new Error(message);
    }
    const blobUrl = URL.createObjectURL(await response.blob());
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}

export async function closeTicket(id, note) {
    return await changeTicketStatus(id, { status: "cerrado", note });
}
export async function assignTicket(id, assigned_to) {

    return api.patch(
        `/tickets/${id}/assign`,
        {
            assigned_to
        }
    );

}
export async function getTechnicians() {

    return api.get("/auth/technicians");

}
