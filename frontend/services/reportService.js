import api from "./api.js";
export async function getReportData(){const [stats,response]=await Promise.all([api.get("/tickets/stats"),api.get("/tickets")]);return {stats,tickets:response.tickets||[]};}
