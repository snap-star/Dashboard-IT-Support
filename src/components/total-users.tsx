"use client";

import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

export default function DashboardOverview() {
  const [totalIpAddress, setTotalIpAddress] = React.useState(0);
  const [totalUserEstim, setTotalUserEstim] = React.useState(0);

  React.useEffect(() => {
    fetchOverviewData();
  }, []);

  async function fetchOverviewData() {
    // Query total IP addresses
    const { data: ipData, error: ipError } = await supabase
      .from("users")
      .select("ip_address", { count: "exact"});
    if (ipError) {
      console.error("Error fetching IP addresses:", ipError);
    } else {
      setTotalIpAddress(ipData.length);
    }

    // Query total User ESTIM
    const { data: userEstimData, error: userEstimError } = await supabase
      .from("users")
      .select("user_estim", { count: "exact"});
    if (userEstimError) {
      console.error("Error fetching User ESTIM:", userEstimError);
    } else {
      setTotalUserEstim(userEstimData.length);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card: Total IP Address */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Total IP Address</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-center">
          {totalIpAddress}
        </CardContent>
      </Card>

      {/* Card: Total User ESTIM */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Total User ESTIM</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold text-center">
          {totalUserEstim}
        </CardContent>
      </Card>
    </div>
  );
}
