// components/ITIncidentOverviewCard.tsx
"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from '@/lib/supabase';


type IncidentCounts = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
};

export function ITIncidentOverviewCard() {
  const [incidentCounts, setIncidentCounts] = useState<IncidentCounts>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    async function fetchIncidentCounts() {
      const { data, error } = await supabase
        .from('it_incidents')
        .select('status');

      if (error) {
        console.error('Error fetching IT incidents:', error);
      } else {
        const counts: IncidentCounts = {
          total: data.length,
          open: data.filter(incident => incident.status === 'Open').length,
          inProgress: data.filter(incident => incident.status === 'In Progress').length,
          resolved: data.filter(incident => incident.status === 'Resolved').length,
          closed: data.filter(incident => incident.status === 'Closed').length,
        };
        setIncidentCounts(counts);
      }
    }

    fetchIncidentCounts();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">IT Incident Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{incidentCounts.total}</div>
        <p className="text-xs text-muted-foreground">
          Total IT incidents reported
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div>Open: {incidentCounts.open}</div>
          <div>In Progress: {incidentCounts.inProgress}</div>
          <div>Resolved: {incidentCounts.resolved}</div>
          <div>Closed: {incidentCounts.closed}</div>
        </div>
      </CardContent>
    </Card>
  );
}
