"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/darkmode";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      className={`flex flex-col md:flex-row h-screen ${
        theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-full md:w-64 flex-shrink-0 shadow-md ${
          theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"
        }`}
      >
        <div className="flex flex-col items-center md:items-start p-4 space-y-4">
          <nav className="w-full">
            <Link
              href="/dashboard"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/reports"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Work Reports
            </Link>
            <Link
              href="/dashboard/input"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Input Data
            </Link>
            <Link
              href="/dashboard/ip-address"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              User ESTIM
            </Link>
            <Link
              href="/dashboard/insiden"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Insiden
            </Link>
            <Link
              href="/dashboard/atm"
              className="block px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Laporan ATM
            </Link>
          </nav>
          <div className="w-full">
            <Button
              variant={"default"}
              size={"default"}
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
          <div className="w-full flex justify-center md:justify-start">
            <ModeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
