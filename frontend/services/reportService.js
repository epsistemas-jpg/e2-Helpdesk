import api from "./api.js";
export async function getReportData(){const [stats,response]=await Promise.all([api.get("/tickets/stats"),api.get("/tickets")]);return {stats,tickets:response.tickets||[]};}
export async function getReport(from, to) {
    return api.get(`/tickets/report?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
}
export async function getTicketRanking(period = "mensual") {
    return await api.get(`/tickets/ranking?period=${encodeURIComponent(period)}`);
}
