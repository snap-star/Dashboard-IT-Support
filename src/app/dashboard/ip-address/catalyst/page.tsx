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
import { MoreHorizontal, Pencil, Trash, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Schema validasi form
const formSchema = z.object({
  location: z.string().min(1, "Lokasi harus diisi"),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format IP Address tidak valid"),
  subnet: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format Subnet tidak valid"),
  gateway: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Format Gateway tidak valid"),
  description: z.string().min(1, "Keterangan harus diisi"),
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
}

const locationOptions = [
  "Cabang Ponorogo",
  "Capem Sumoroto",
  "Capem Jetis",
  "Capem Pulung",
  "Capem Balong"
];

export default function CatalystIPAddressPage() {
  const [ipAddresses, setIpAddresses] = useState<IPAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedIp, setSelectedIp] = useState<IPAddress | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true
      }
    }
  );

  // Fetch data dari Supabase
  const fetchIpAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('ip_addresses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIpAddresses(data || []);
    } catch (error) {
      console.error('Error fetching IP addresses:', error);
      toast.error('Gagal memuat data IP Address');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIpAddresses();
  }, []);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && selectedIp) {
        // Update existing IP
        const { error } = await supabase
          .from('ip_addresses')
          .update({
            location: values.location,
            ip_address: values.ipAddress,
            subnet: values.subnet,
            gateway: values.gateway,
            description: values.description,
          })
          .eq('id', selectedIp.id);

        if (error) throw error;
        toast.success("IP Address berhasil diperbarui");
      } else {
        // Add new IP
        const { error } = await supabase
          .from('ip_addresses')
          .insert([{
            location: values.location,
            ip_address: values.ipAddress,
            subnet: values.subnet,
            gateway: values.gateway,
            description: values.description,
          }]);

        if (error) throw error;
        toast.success("IP Address berhasil ditambahkan");
      }
      
      fetchIpAddresses(); // Refresh data
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving IP address:', error);
      toast.error('Gagal menyimpan data IP Address');
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
      description: ip.description,
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
          .from('ip_addresses')
          .delete()
          .eq('id', selectedIp.id);

        if (error) throw error;
        toast.success("IP Address berhasil dihapus");
        fetchIpAddresses(); // Refresh data
      } catch (error) {
        console.error('Error deleting IP address:', error);
        toast.error('Gagal menghapus IP Address');
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
      description: ""
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
      description: ""
    });
    setIsDialogOpen(true);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">IP Address Cisco Catalyst</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah IP Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit IP Address" : "Tambah IP Address Baru"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keterangan</FormLabel>
                      <FormControl>
                        <Input placeholder="Deskripsi IP Address..." {...field} />
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lokasi</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Subnet Mask</TableHead>
              <TableHead>Gateway</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="w-[70px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ipAddresses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Tidak ada data IP Address
                </TableCell>
              </TableRow>
            ) : (
              ipAddresses.map((ip) => (
                <TableRow key={ip.id}>
                  <TableCell className="font-medium">{ip.location}</TableCell>
                  <TableCell>{ip.ip_address}</TableCell>
                  <TableCell>{ip.subnet}</TableCell>
                  <TableCell>{ip.gateway}</TableCell>
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

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus IP Address ini? 
              Tindakan ini tidak dapat dibatalkan.
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
    </div>
  );
}
