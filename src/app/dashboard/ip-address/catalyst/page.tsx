"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  Plus,
  Calculator,
  Search,
  Trash2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { calculateSubnetInfo } from "@/lib/ip-calculator";
import { Label } from "@/components/ui/label";

// Schema validasi form
const formSchema = z.object({
  location: z.string().min(1, "Lokasi harus diisi"),
  ipAddress: z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format IP Address tidak valid"),
  subnet: z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format Subnet tidak valid"),
  gateway: z
    .string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format Gateway tidak valid"),
  description: z.string().optional(),
  user_estim: z.string().optional(),
  display_estim: z.string().optional(),
});

// Update interface untuk menyesuaikan dengan Supabase
interface IPAddress {
  id: string;
  created_at: string;
  location: string;
  ip_address: string;
  subnet: string;
  gateway: string;
  description: string;
  user_estim?: string;
  display_estim?: string;
}

const locationOptions = [
  "Cabang Ponorogo",
  "Capem Sumoroto",
  "Capem Jetis",
  "Capem Pulung",
  "Capem Balong",
  "KFF Pemda Ponorogo",
  "KFF Sukorejo",
  "KFF Jenangan",
  "KFF RSUD Harjono",
  "KFF Slahung",
  "KFF Sawoo",
  "Payment Point Samsat Ponorogo",
  "Payment Point BPKAD Ponorogo",
  "Mall Pelayanan Publik Ponorogo",
];

// Update interface untuk IP Calculator props
interface IPCalculatorProps {
  onGenerate: (
    ips: Array<{
      location: string;
      ip_address: string;
      subnet: string;
      gateway: string;
    }>,
  ) => void;
}

// Update komponen IP Calculator
const IPCalculator = ({ onGenerate }: IPCalculatorProps) => {
  const [network, setNetwork] = useState("");
  const [subnetMask, setSubnetMask] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  // Gunakan location options yang sama dengan form utama
  const locationOptions = [
    "Cabang Ponorogo",
    "Capem Sumoroto",
    "Capem Jetis",
    "Capem Pulung",
    "Capem Balong",
    "KFF Pemda Ponorogo",
    "KFF Sukorejo",
    "KFF Jenangan",
    "KFF RSUD Harjono",
    "KFF Slahung",
    "KFF Sawoo",
    "Payment Point Samsat Ponorogo",
    "Payment Point BPKAD Ponorogo",
    "Mall Pelayanan Publik Ponorogo",
  ];

  const handleCalculate = () => {
    try {
      if (!location) {
        throw new Error("Silakan pilih lokasi terlebih dahulu");
      }

      const subnetInfo = calculateSubnetInfo(network, subnetMask);
      const gateway = subnetInfo.usableHosts[0]; // Ambil IP pertama sebagai gateway

      // Map IP addresses dengan lokasi dan subnet yang sama
      const generatedIPs = subnetInfo.usableHosts.slice(1).map((ip) => ({
        location,
        ip_address: ip,
        subnet: subnetMask,
        gateway: gateway,
      }));

      onGenerate(generatedIPs);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Lokasi</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Network Address</Label>
          <Input
            placeholder="192.168.1.0"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Subnet Mask</Label>
          <Input
            placeholder="255.255.255.0"
            value={subnetMask}
            onChange={(e) => setSubnetMask(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        onClick={handleCalculate}
        disabled={!network || !subnetMask || !location}
      >
        Generate IP Addresses
      </Button>
    </div>
  );
};

// Types dan interfaces tetap di luar
type SortConfig = {
  column: string;
  direction: "asc" | "desc";
} | null;

export default function CatalystIPAddressPage() {
  // Pindahkan state sortConfig ke dalam komponen
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [ipAddresses, setIpAddresses] = useState<IPAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<IPAddress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [calculatedIPs, setCalculatedIPs] = useState<string[]>([]);
  const [showIPCalculator, setShowIPCalculator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPurgeAlertOpen, setIsPurgeAlertOpen] = useState(false);

  const PAGE_SIZE = 10;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
      },
    },
  );

  // Fetch data dari Supabase
  const fetchIpAddresses = async () => {
    try {
      setIsLoading(true);

      // Count total rows dengan search filter
      let countQuery = supabase
        .from("ip_addresses")
        .select("*", { count: "exact" });

      if (searchQuery) {
        countQuery = countQuery.or(
          `ip_address.ilike.%${searchQuery}%,` +
            `location.ilike.%${searchQuery}%,` +
            `description.ilike.%${searchQuery}%`,
        );
      }

      const { count, error: countError } = await countQuery;

      if (countError) throw countError;

      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));

      // Fetch data dengan pagination, search, dan sorting
      let dataQuery = supabase
        .from("ip_addresses")
        .select("*")
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

      if (searchQuery) {
        dataQuery = dataQuery.or(
          `ip_address.ilike.%${searchQuery}%,` +
            `location.ilike.%${searchQuery}%,` +
            `description.ilike.%${searchQuery}%`,
        );
      }

      // Tambahkan sorting jika ada
      if (sortConfig) {
        dataQuery = dataQuery.order(sortConfig.column, {
          ascending: sortConfig.direction === "asc",
        });
      } else {
        // Default sort
        dataQuery = dataQuery.order("created_at", { ascending: false });
      }

      const { data, error: dataError } = await dataQuery;

      if (dataError) throw dataError;

      setIpAddresses(data || []);
    } catch (error: any) {
      console.error("Error detail:", error);
      toast.error(error.message || "Gagal memuat data IP Address");
      setIpAddresses([]);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Tambahkan fungsi untuk handle sorting
  const handleSort = (column: string) => {
    setSortConfig((current) => {
      if (current?.column === column) {
        // Jika kolom yang sama, ubah direction
        return {
          column,
          direction: current.direction === "asc" ? "desc" : "asc",
        };
      }
      // Jika kolom berbeda, set ke ascending
      return {
        column,
        direction: "asc",
      };
    });
  };

  // Tambahkan useEffect untuk search
  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      setCurrentPage(1); // Reset ke halaman pertama saat search
      fetchIpAddresses();
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);

  // Tambahkan useEffect untuk pagination
  useEffect(() => {
    fetchIpAddresses();
  }, [currentPage]);

  // Update useEffect untuk merefresh data saat sorting berubah
  useEffect(() => {
    fetchIpAddresses();
  }, [currentPage, searchQuery, sortConfig]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      ipAddress: "",
      subnet: "",
      gateway: "",
      description: "",
    },
  });

  // Tambahkan fungsi untuk cek duplikasi IP
  const checkDuplicateIP = async (ipAddress: string, currentId?: string) => {
    try {
      let query = supabase
        .from("ip_addresses")
        .select("id")
        .eq("ip_address", ipAddress);

      // Jika sedang edit, exclude IP yang sedang diedit
      if (currentId) {
        query = query.neq("id", currentId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.length > 0;
    } catch (error) {
      console.error("Error checking duplicate IP:", error);
      return false;
    }
  };

  // Update fungsi onSubmit untuk mengecek duplikasi
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const isDuplicate = await checkDuplicateIP(
        values.ipAddress,
        isEditing ? selectedIp?.id : undefined,
      );

      if (isDuplicate) {
        toast.error("IP Address sudah digunakan");
        return;
      }

      if (isEditing && selectedIp) {
        // Update existing IP
        const { error } = await supabase
          .from("ip_addresses")
          .update({
            location: values.location,
            ip_address: values.ipAddress,
            subnet: values.subnet,
            gateway: values.gateway,
            description: values.description,
            user_estim: values.user_estim,
            display_estim: values.display_estim,
          })
          .eq("id", selectedIp.id);

        if (error) throw error;
        toast.success("IP Address berhasil diperbarui");
      } else {
        // Add new IP
        const { error } = await supabase.from("ip_addresses").insert([
          {
            location: values.location,
            ip_address: values.ipAddress,
            subnet: values.subnet,
            gateway: values.gateway,
            description: values.description,
            user_estim: values.user_estim,
            display_estim: values.display_estim,
          },
        ]);

        if (error) throw error;
        toast.success("IP Address berhasil ditambahkan");
      }

      fetchIpAddresses();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving IP address:", error);
      toast.error("Gagal menyimpan data IP Address");
    }
  };

  const handleEdit = (ip: IPAddress) => {
    setSelectedIp(ip);
    setIsEditing(true);
    form.reset({
      location: ip.location,
      ipAddress: ip.ip_address,
      subnet: ip.subnet,
      gateway: ip.gateway,
      description: ip.description || "",
      user_estim: ip.user_estim || "",
      display_estim: ip.display_estim || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (ip: IPAddress) => {
    setSelectedIp(ip);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedIp) {
      try {
        const { error } = await supabase
          .from("ip_addresses")
          .delete()
          .eq("id", selectedIp.id);

        if (error) throw error;
        toast.success("IP Address berhasil dihapus");
        fetchIpAddresses(); // Refresh data
      } catch (error) {
        console.error("Error deleting IP address:", error);
        toast.error("Gagal menghapus IP Address");
      }
    }
    setIsDeleteAlertOpen(false);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedIp(null);
    form.reset({
      location: "",
      ipAddress: "",
      subnet: "",
      gateway: "",
      description: "",
    });
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedIp(null);
    form.reset({
      location: "",
      ipAddress: "",
      subnet: "",
      gateway: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleGenerateIPs = async (
    generatedIPs: Array<{
      location: string;
      ip_address: string;
      subnet: string;
      gateway: string;
    }>,
  ) => {
    try {
      const newIPs = generatedIPs.map((ip) => ({
        ...ip,
        description: "", // Kolom description kosong untuk diisi manual nanti
        user_estim: "",
        display_estim: "",
      }));

      const { error } = await supabase.from("ip_addresses").insert(newIPs);

      if (error) throw error;

      toast.success(`${newIPs.length} IP Addresses berhasil ditambahkan`);
      await fetchIpAddresses();
      setShowIPCalculator(false);
    } catch (error: any) {
      console.error("Error adding IP addresses:", error);
      toast.error(error.message || "Gagal menambahkan IP Addresses");
    }
  };

  // Tambahkan fungsi untuk purge data
  const handlePurgeData = async () => {
    try {
      // Hapus semua data tanpa pengecualian
      const { error } = await supabase
        .from("ip_addresses")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Gunakan UUID kosong sebagai placeholder jika perlu

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }

      toast.success("Semua data berhasil dihapus");
      await fetchIpAddresses(); // Tunggu sampai data selesai di-fetch
    } catch (error: any) {
      console.error("Error detail:", error);
      toast.error(error.message || "Gagal menghapus data");
    } finally {
      setIsPurgeAlertOpen(false);
    }
  };

  // Tambahkan loading state di table
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                IP Address Cisco Catalyst
              </CardTitle>
              <CardDescription>
                Manajemen IP Address untuk perangkat Cisco Catalyst
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowIPCalculator(true)}
              >
                <Calculator className="mr-2 h-4 w-4" />
                IP Calculator
              </Button>
              <Button
                variant="destructive"
                onClick={() => setIsPurgeAlertOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Purge Data
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah IP
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isEditing ? "Edit IP Address" : "Tambah IP Address Baru"}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lokasi</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih lokasi" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {locationOptions.map((location) => (
                                  <SelectItem key={location} value={location}>
                                    {location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ipAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IP Address</FormLabel>
                            <FormControl>
                              <Input placeholder="192.168.1.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="subnet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subnet Mask</FormLabel>
                            <FormControl>
                              <Input placeholder="255.255.255.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gateway"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gateway</FormLabel>
                            <FormControl>
                              <Input placeholder="192.168.1.254" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="user_estim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>User Estim</FormLabel>
                              <FormControl>
                                <Input placeholder="user estim..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="display_estim"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Estim</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="display estim..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Keterangan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Deskripsi IP Address..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button type="submit">
                          {isEditing ? "Simpan Perubahan" : "Tambah"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari IP Address, lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("location")}
                  >
                    <div className="flex items-center gap-1">
                      Lokasi
                      {sortConfig?.column === "location" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("ip_address")}
                  >
                    <div className="flex items-center gap-1">
                      IP Address
                      {sortConfig?.column === "ip_address" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("subnet")}
                  >
                    <div className="flex items-center gap-1">
                      Subnet Mask
                      {sortConfig?.column === "subnet" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("gateway")}
                  >
                    <div className="flex items-center gap-1">
                      Gateway
                      {sortConfig?.column === "gateway" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("user_estim")}
                  >
                    <div className="flex items-center gap-1">
                      User Estim
                      {sortConfig?.column === "user_estim" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("display_estim")}
                  >
                    <div className="flex items-center gap-1">
                      Display Estim
                      {sortConfig?.column === "display_estim" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="font-semibold cursor-pointer hover:bg-muted/80"
                    onClick={() => handleSort("description")}
                  >
                    <div className="flex items-center gap-1">
                      Keterangan
                      {sortConfig?.column === "description" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 opacity-50" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-[70px] font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-6 w-6 text-primary"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="ml-2">Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : ipAddresses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {searchQuery
                        ? "Tidak ada data yang sesuai dengan pencarian"
                        : "Tidak ada data IP Address"}
                    </TableCell>
                  </TableRow>
                ) : (
                  ipAddresses.map((ip) => (
                    <TableRow key={ip.id}>
                      <TableCell className="font-medium">
                        {ip.location}
                      </TableCell>
                      <TableCell>{ip.ip_address}</TableCell>
                      <TableCell>{ip.subnet}</TableCell>
                      <TableCell>{ip.gateway}</TableCell>
                      <TableCell>{ip.user_estim}</TableCell>
                      <TableCell>{ip.display_estim}</TableCell>
                      <TableCell>{ip.description}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(ip)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(ip)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* IP Calculator Dialog */}
      <Dialog open={showIPCalculator} onOpenChange={setShowIPCalculator}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>IP Calculator</DialogTitle>
            <DialogDescription>
              Generate IP addresses berdasarkan network dan subnet
            </DialogDescription>
          </DialogHeader>
          <IPCalculator onGenerate={handleGenerateIPs} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus IP Address ini? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Purge Alert Dialog */}
      <AlertDialog open={isPurgeAlertOpen} onOpenChange={setIsPurgeAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Semua Data</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus semua data IP Address? Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handlePurgeData}
            >
              Ya, Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
