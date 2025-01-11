"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

type User = {
  id: number;
  user_estim: string;
  ip_address: string;
  nama: string;
  nip: string;
  jabatan: string;
  unit_kerja: string;
  cab: string;
  status_user: string;
};

export default function IPAddressManagement() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [newUser, setNewUser] = React.useState<Omit<User, "id">>({
    user_estim: "",
    ip_address: "",
    nama: "",
    nip: "",
    jabatan: "",
    unit_kerja: "",
    cab: "",
    status_user: "",
  });

  React.useEffect(() => {
    fetchUsers();
  }, []);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
      //simpan timestamp terakhir kali di fetch
      setLastUpdated(new Date().toLocaleString());
    }
  }

  async function handleCreateOrUpdateUser() {
    if (editingUser) {
      const { error } = await supabase
        .from("users")
        .update(editingUser)
        .eq("id", editingUser.id);
      if (error) {
        console.error("Error updating user:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("users").insert([newUser]);
      if (error) {
        console.error("Error creating user:", error);
        return;
      }
    }
    fetchUsers(); //ambil data terbaru
    setIsDialogOpen(false);
    setEditingUser(null);
    setNewUser({
      user_estim: "",
      ip_address: "",
      nama: "",
      nip: "",
      jabatan: "",
      unit_kerja: "",
      cab: "",
      status_user: "",
    });
    setLastUpdated(new Date().toLocaleString());//update timestamp
  }

  async function handleDeleteUser(id: number) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Error deleting user:", error);
      return;
    }
    fetchUsers();
    setLastUpdated(new Date().toLocaleString());
  }

  //fungsi export excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "Data User ESTIM.xlsx");
  };
  //fungsi print
  const printTable = () => {
    window.print();
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "user_estim",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User ESTIM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "ip_address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            IP Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      enableSorting: true,
    },
    { accessorKey: "nama", header: "Nama Pemegang" },
    { accessorKey: "nip", header: "NIP" },
    { accessorKey: "jabatan", header: "Jabatan" },
    { accessorKey: "unit_kerja", header: "Unit Kerja" },
    { accessorKey: "cab", header: "Cabang" },
    { accessorKey: "status_user", header: "Status User" },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setEditingUser(row.original);
                setIsDialogOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteUser(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-end py-4 gap-2">
        <Input
          placeholder="User/NIP/Nama untuk Filter data..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {/* <DialogTrigger asChild> */}
        <Button variant={"outline"} size={"default"} onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant={"outline"} size={"default"} onClick={printTable}>
          Print
        </Button>
        <Button
          variant={"default"}
          size={"default"}
          onClick={() => setIsDialogOpen(true)}
        >
          Add New User
        </Button>
        {/* </DialogTrigger> */}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.keys(newUser).map((key) =>
              key === "unit_kerja" ? (
                <Select
                  key={key}
                  value={
                    editingUser ? editingUser.unit_kerja : newUser.unit_kerja
                  }
                  onValueChange={(value) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, unit_kerja: value })
                      : setNewUser({ ...newUser, unit_kerja: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Unit Kerja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Umum">Umum</SelectItem>
                    <SelectItem value="Pelayanan Nasabah">
                      Pelayanan Nasabah
                    </SelectItem>
                    <SelectItem value="Teller">Teller</SelectItem>
                    <SelectItem value="Service Assitant">
                      Service Assistant
                    </SelectItem>
                    <SelectItem value="Kredit">Kredit</SelectItem>
                    <SelectItem value="RPK">RPK</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                  </SelectContent>
                </Select>
              ) : key === "status_user" ? (
                <Select
                  key={key}
                  value={
                    editingUser ? editingUser.status_user : newUser.status_user
                  }
                  onValueChange={(value) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, status_user: value })
                      : setNewUser({ ...newUser, status_user: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                  </SelectContent>
                </Select>
              ) : key === "cab" ? (
                <Select
                  key={key}
                  value={editingUser ? editingUser.cab : newUser.cab}
                  onValueChange={(value) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, cab: value })
                      : setNewUser({ ...newUser, cab: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Cabang" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cabang Ponorogo">
                      Cabang Ponorogo
                    </SelectItem>
                    <SelectItem value="Capem Sumoroto">
                      Capem Sumoroto
                    </SelectItem>
                    <SelectItem value="Capem Jetis">Capem Jetis</SelectItem>
                    <SelectItem value="Capem Pulung">Capem Pulung</SelectItem>
                    <SelectItem value="Capem Balong">Capem Balong</SelectItem>
                    <SelectItem value="KFF Pemda Ponorogo">
                      KFF Pemda Ponorogo
                    </SelectItem>
                    <SelectItem value="KFF Sukorejo">KFF Sukorejo</SelectItem>
                    <SelectItem value="KFF Jenangan">KFF Jenangan</SelectItem>
                    <SelectItem value="KFF RSUD Harjono">
                      KFF RSUD Harjono
                    </SelectItem>
                    <SelectItem value="KFF Slahung">KFF Slahung</SelectItem>
                    <SelectItem value="KFF Sawoo">KFF Sawoo</SelectItem>
                    <SelectItem value="Payment Point Samsat">
                      Payment Point Samsat
                    </SelectItem>
                    <SelectItem value="Mall Pelayanan Publik Ponorogo">
                      Mall Pelayanan Publik Ponorogo
                    </SelectItem>
                    <SelectItem value="Payment Point PBB Ponorogo">
                      Payment Point PBB Ponorogo
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  key={key}
                  placeholder={key}
                  value={
                    editingUser
                      ? editingUser[key as keyof User] || ""
                      : newUser[key as keyof Omit<User, "id">]
                  }
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({
                          ...editingUser,
                          [key]: e.target.value,
                        })
                      : setNewUser({
                          ...newUser,
                          [key]: e.target.value,
                        })
                  }
                />
              )
            )}
          </div>
          <Button onClick={handleCreateOrUpdateUser}>
            {editingUser ? "Update User" : "Create User"}
          </Button>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Daftar User ESTIM & IP Address
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="italic text-xs text-muted-foreground">
            Last updated pada {lastUpdated}
          </CardFooter>
        </Card>
      </div>
      <div className="flex justify-between items-center py-4">
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rows
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
