// components/TotalIncidentsCard.tsx
"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

export function TotalIncidentsCard() {
  const [totalIncidents, setTotalIncidents] = useState<number>(0);

  useEffect(() => {
    async function fetchTotalIncidents() {
      const { count, error } = await supabase
        .from('atm_complaints')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total incidents:', error);
      } else {
        setTotalIncidents(count || 0);
      }
    }

    fetchTotalIncidents();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalIncidents}</div>
        <p className="text-xs text-muted-foreground">
          Total ATM complaints reported
        </p>
      </CardContent>
    </Card>
  );
}
