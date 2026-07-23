import { TicketForm } from "../../components/tickets/TicketForm.js";
import api from "../../services/api.js";

export async function CreateTicketPage() {

    let offices = [];

    try {

        const response = await api.get("/auth/offices");

        offices = response.offices || [];

    } catch (error) {

        console.error("Error cargando oficinas:", error);

    }

    return TicketForm(offices);

}