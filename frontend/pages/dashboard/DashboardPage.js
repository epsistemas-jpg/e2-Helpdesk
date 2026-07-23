import { SummaryCards } from "../../components/dashboard/SummaryCards.js";
import { RecentActivity } from "../../components/dashboard/RecentActivity.js";
import { getDashboardData } from "../../services/dashboardService.js";

export async function DashboardPage() {

    const data = await getDashboardData();

    return `

        ${SummaryCards(data.stats)}

        <br>

        ${RecentActivity(data.recent.slice(0,5))}

    `;

}