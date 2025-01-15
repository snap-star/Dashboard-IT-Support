// components/TotalIncidentsCard.tsx
"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supabase from '@/lib/supabase';
import { AlertOctagon } from "lucide-react";
import { motion } from "framer-motion";

export function TotalIncidentsCard() {
  const [totalIncidents, setTotalIncidents] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    fetchTotalIncidents();
  }, []);

  async function fetchTotalIncidents() {
    setIsLoading(true);
    try {
      const { count, error } = await supabase
        .from('atm_complaints')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching total incidents:', error);
      } else {
        setTotalIncidents(count || 0);
        setLastUpdated(new Date().toLocaleString());
      }
    } finally {
      setIsLoading(false);
    }
  }

  const AnimatedNumber = ({ value }: { value: number }) => {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 100,
          delay: 0.2
        }}
        className="text-4xl font-bold text-primary"
      >
        {value.toLocaleString()}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AlertOctagon className="h-5 w-5 text-red-500" />
            </motion.div>
            <CardTitle className="text-sm font-medium">Total ATM Incidents</CardTitle>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-red-100 text-red-500 px-2 py-1 rounded-full text-xs font-medium"
          >
            ATM Complaints
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-gray-100 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <AnimatedNumber value={totalIncidents} />
                <div className="flex flex-col gap-1">
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xs text-muted-foreground"
                  >
                    Total ATM complaints reported
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] text-muted-foreground/60 italic"
                  >
                    Last updated: {lastUpdated}
                  </motion.p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
