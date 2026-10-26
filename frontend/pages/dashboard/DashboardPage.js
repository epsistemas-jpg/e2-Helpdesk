import { RecentActivity } from "../../components/dashboard/RecentActivity.js";
import { DashboardInsights } from "../../components/dashboard/DashboardInsights.js";
import { getDashboardData } from "../../services/dashboardService.js";

export async function DashboardPage() {

    const data = await getDashboardData();

    return `

        ${DashboardInsights(data.stats)}

        ${RecentActivity(data.recent.slice(0,5))}

    `;

}
