import { ITIncidentOverviewCard } from "@/components/ITIncidentOverviewCard";
import DashboardOverview from "@/components/total-users";
import { TotalIncidentsCard } from "@/components/TotalIncidentsCard";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <div className="flex items-center gap-2">
            {/* Add any actions/filters here */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-4">
            <TotalIncidentsCard />
          </Card>
          <Card className="p-4">
            <DashboardOverview />
          </Card>
          <Card className="p-4 md:col-span-2 lg:col-span-1">
            <ITIncidentOverviewCard />
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            {/* Add your chart component here */}
            <div className="aspect-[4/3] rounded-lg bg-muted/50" />
          </Card>
          <Card className="p-4">
            {/* Add another chart component here */}
            <div className="aspect-[4/3] rounded-lg bg-muted/50" />
          </Card>
        </div>

        {/* Recent Activity or Table Section */}
        <Card className="p-4">
          {/* Add your table or recent activity component here */}
          <div className="h-[300px] rounded-lg bg-muted/50" />
        </Card>
      </div>
    </ScrollArea>
  );
}
