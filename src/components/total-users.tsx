"use client";

import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from "@/lib/supabase";

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
      .select("ip_address", { count: "exact", head:false})
    if (ipError) {
      console.error("Error fetching IP addresses:", ipError);
    } else {
      setTotalIpAddress(ipData.length);
    }

    // Query total User ESTIM
    const { data: userEstimData, error: userEstimError } = await supabase
      .from("users")
      .select("user_estim", { count: "exact", head: false});
    if (userEstimError) {
      console.error("Error fetching User ESTIM:", userEstimError);
    } else {
      setTotalUserEstim(userEstimData.length);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card: Total IP Address */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">IP Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
          {totalIpAddress}
          </div>
          <p className="text-xs text-muted-foreground">
            Total IP addresses registered
          </p>
        </CardContent>
      </Card>

      {/* Card: Total User ESTIM */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User ESTIM</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
          {totalUserEstim}
          </div>
          <p className="text-xs text-muted-foreground">
            Total User ESTIM sudah diregistrasi
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
