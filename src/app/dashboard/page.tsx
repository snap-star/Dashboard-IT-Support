// FILEPATH: e:/work-report/dev/reportapp/src/app/dashboard/page.tsx

import DashboardOverview from "@/components/total-users";
import { TotalIncidentsCard } from "@/components/TotalIncidentsCard";
import { ITIncidentOverviewCard } from "@/components/ITIncidentOverviewCard";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TotalIncidentsCard />
        <ITIncidentOverviewCard />
        <DashboardOverview />
        {/* Add more cards here as needed */}
      </div>
    </div>
  );
}
