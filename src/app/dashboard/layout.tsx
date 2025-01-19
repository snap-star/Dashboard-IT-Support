"use client";
import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/darkmode";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import supabase from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Menu,
  Users,
  LayoutDashboard,
  FileText,
  PenTool,
  Network,
  AlertCircle,
  CreditCard,
  Calendar,
  HardDrive,
  Database,
  LogOut,
  Wrench
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      href: "/dashboard/aktivitas",
      label: "Aktivitas",
      icon: <FileText className="h-4 w-4" />,
      subItems: [
        { href: "/dashboard/reports", label: "Pengecekan Ruang Server" },
        { href: "/dashboard/insiden", label: "Input Insiden Kantor" },
        { href: "/dashboard/atm", label: "Input Komplain ATM" },
        { href: "/dashboard/lembur", label: "Buat Nota Lembur" }
      ]
    },
    {
      href: "/dashboard/rekon_atm",
      label: "ATM",
      icon: <CreditCard className="h-4 w-4" />,
      subItems: [
        { href: "/dashboard/rekon_atm", label: "Rekon ATM" },
        { href: "/dashboard/atm/rekap-transaksi", label: "Buat Report ATM" }
      ]
    },
    { href: "/dashboard/ip-address", label: "Manage User ESTIM", icon: <Users className="h-4 w-4" /> },
    { 
      href: "/dashboard/weekend_banking", 
      label: "Weekend Banking", 
      icon: <Calendar className="h-4 w-4" />,
      subItems: [
        { href: "/dashboard/weekend_banking", label: "Laporan Weekend Banking" },
        { href: "/dashboard/weekend_banking/pengajuan", label: "Pengajuan Weekend/Perpanjangan" }
      ]
    },
    {
      href: "/dashboard/asset",
      label: "Asset Management",
      icon: <HardDrive className="h-4 w-4" />,
      subItems: [
        { href: "/dashboard/asset/hardware", label: "Hardware", icon: <HardDrive className="h-4 w-4" /> },
        { href: "/dashboard/asset/software", label: "Software", icon: <Database className="h-4 w-4" /> },
        { href: "/dashboard/asset/edc", label: "Asset EDC", icon: <Network className="h-4 w-4" /> },
      ],
    },
    {
      href: "/dashboard/macro",
      label: "Tools",
      icon: <Wrench className="h-4 w-4" />,
      subItems: [
        { href: "/dashboard/macro/generator", label: "Macro Generator", icon: <Users className="h-4 w-4" /> },
        { href: "/dashboard/ip-address/catalyst", label: "IP Address Catalyst", icon: <Users className="h-4 w-4" /> },
      ],
    },
  ];

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[200px] w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-[120px]" />
        <Skeleton className="h-[120px]" />
      </div>
    </div>
  );

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image 
            src="/logo.png"
            alt="IT Support Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="font-bold">IT Support Dashboard</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4">
          <div className="py-2">
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.href}>
                  {item.subItems ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="weekend-banking" className="border-none">
                        <AccordionTrigger className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 hover:no-underline">
                          <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="ml-6 mt-2 space-y-2">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-6 space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Skeleton className="h-4 w-4" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
        <div className="flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            className="md:hidden fixed left-4 top-4 z-40 p-2 rounded-lg shadow-md hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">
            Menu Navigasi
          </SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          {isLoading ? <LoadingSkeleton /> : children}
        </div>
      </main>
    </div>
  );
}
