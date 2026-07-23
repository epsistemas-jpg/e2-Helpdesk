import api from "./api.js";

export async function getDashboardData() {

    const [stats, tickets] = await Promise.all([

        api.get("/tickets/stats"),

        api.get("/tickets")

    ]);

    return {

        stats,

        recent: tickets.tickets || []

    };

}