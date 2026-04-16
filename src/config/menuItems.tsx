import { PersonIcon } from "@radix-ui/react-icons";
import { Computer, FileWarning, LucideIcon, Video } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Calendar,
  HardDrive,
  Wrench,
  CreditCard,
} from "lucide-react";
import { title } from "process";

export const navMain = [
  {
    title: "Aktivitas",
    url: "/dashboard/aktivitas",
    icon: FileText,
    items: [
      {
        title: "Input Komplain ATM",
        url: "/dashboard/atm",
      },
      {
        title: "Buat Nota Lembur",
        url: "/dashboard/lembur",
      },
      {
        title: "Buat Catatan",
        url: "/dashboard/note",
      },
    ],
  },
  {
    title: "ATM",
    url: "/dashboard/rekon_atm",
    icon: CreditCard,
    items: [
      {
        title: "Rekon ATM",
        url: "/dashboard/rekon_atm",
      },
      {
        title: "Buat Report ATM",
        url: "/dashboard/atm/rekap-transaksi",
      },
    ],
  },
  {
    title: "Weekend Banking",
    url: "/dashboard/weekend_banking",
    icon: Calendar,
    items: [
      {
        title: "Laporan Weekend Banking",
        url: "/dashboard/weekend_banking",
      },
      {
        title: "Pengajuan Weekend/Perpanjangan",
        url: "/dashboard/weekend_banking/pengajuan",
      },
    ],
  },
  {
    title: "Asset Management",
    url: "/dashboard/asset",
    icon: HardDrive,
    items: [
      {
        title: "Hardware",
        url: "/dashboard/asset/hardware",
      },
      {
        title: "Software",
        url: "/dashboard/asset/software",
      },
      {
        title: "Asset EDC",
        url: "/dashboard/asset/edc",
      },
    ],
  },
  {
    title: "Tools",
    url: "/dashboard/macro",
    icon: Wrench,
    items: [
      {
        title: "Macro Generator",
        url: "/dashboard/macro/generator",
      },
      {
        title: "IP Address Catalyst",
        url: "/dashboard/ip-address/catalyst",
      },
      {
        title: "IP Address Calculator",
        url: "/dashboard/ip-address-calculator",
      }
    ],
  },
];

export const singleNavMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Rekap User ESTIM",
    url: "/dashboard/estim",
    icon: Users,
  },
  {
    title: "Pengecekan Ruang Server",
    url: "/dashboard/reports",
    icon: Computer,
  },
  {
    title: "Form Register CCTV",
    url: "/dashboard/cctv",
    icon: Video,
  },
  {
    title: "Input Insiden Kantor",
    url: "/dashboard/insiden",
    icon: FileWarning,
  },
  {
    title: "Data Pegawai",
    url: "/dashboard/pegawai",
    icon: PersonIcon,
  }
];

export type NavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export type SingleNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
};
