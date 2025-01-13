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
import supabase from "@/lib/supabase";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type User = {
  id: number;
  user_estim: string;
  ip_address: string;
  mac_address: string;
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
    mac_address: "",
    nama: "",
    nip: "",
    jabatan: "",
    unit_kerja: "",
    cab: "",
    status_user: "",
  });
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(10);
  
  React.useEffect(() => {
    fetchUsers();
  }, []);
  const [lastUpdated, setLastUpdated] = React.useState<string>("");

  // Tambahkan fungsi ini sebelum useEffect
const groupUsersByNIP = (users: User[]) => {
  const grouped = users.reduce((acc, user) => {
    const key = `${user.nip}-${user.nama}`;
    if (!acc[key]) {
      acc[key] = user;
    } else {
      // Jika user dengan NIP yang sama sudah ada, gabungkan informasi user
      acc[key].user_estim += `, ${user.user_estim}`;
      acc[key].ip_address += `, ${user.ip_address}`;
      acc[key].mac_address += `, ${user.mac_address}`;
    }
    return acc;
  }, {} as Record<string, User>);

  return Object.values(grouped);
};

// Update fungsi fetchUsers
async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error fetching users:", error);
  } else {
    const groupedUsers = groupUsersByNIP(data || []);
    setUsers(groupedUsers);
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
      mac_address: "",
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

  // Tambahkan fungsi untuk mengupdate data berdasarkan user_estim
  async function updateEmptyUsers() {
    try {
      // Ambil semua data dari database
      const { data: allUsers, error: fetchError } = await supabase
        .from("users")
        .select("*");

      if (fetchError) throw fetchError;

      // Buat map untuk menyimpan data referensi
      const userEstimMap = new Map();

      // Isi map dengan data yang memiliki informasi lengkap
      allUsers?.forEach(user => {
        if (user.user_estim && user.nama && user.nip) {
          userEstimMap.set(user.user_estim, {
            nama: user.nama,
            nip: user.nip,
            jabatan: user.jabatan,
            unit_kerja: user.unit_kerja,
            cab: user.cab,
            status_user: user.status_user
          });
        }
      });

      // Update data yang kosong berdasarkan user_estim
      const updates = [];
      for (const user of allUsers || []) {
        if (user.user_estim && (!user.nama || !user.nip)) {
          const referenceData = userEstimMap.get(user.user_estim);
          if (referenceData) {
            updates.push({
              id: user.id,
              ...referenceData
            });
          }
        }
      }

      // Lakukan update batch
      if (updates.length > 0) {
        for (const update of updates) {
          const { error: updateError } = await supabase
            .from("users")
            .update(update)
            .eq("id", update.id);
          
          if (updateError) throw updateError;
        }
      }

      // Refresh data
      await fetchUsers();
      alert(`Berhasil mengupdate ${updates.length} data`);
    } catch (error) {
      console.error("Error updating users:", error);
      alert("Terjadi kesalahan saat mengupdate data");
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "No",
      header: "No",
      enableSorting: false,
      enableHiding: false,
      size: 60,
      cell: ({ row }) => {
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return pageIndex * pageSize + row.index + 1;
      },
    },
    {
      accessorKey: "nama",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Pemegang
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      size: 200,
      enableSorting: true,
    },
    {
      accessorKey: "nip",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            NIP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      size: 150,
      enableSorting: true,
    },
    {
      accessorKey: "jabatan",
      header: "Jabatan",
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: "unit_kerja",
      header: "Unit Kerja",
      size: 150,
      enableSorting: false,
    },
    {
      accessorKey: "cab",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Cabang/Capem
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      size: 180,
      enableSorting: true,
    },
    {
      id: "user_details",
      header: "User Details",
      size: 400,
      enableResizing: true,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="font-semibold">User ESTIM:</span>
                <br />
                <span className="whitespace-pre-wrap break-words">
                  {user.user_estim}
                </span>
              </div>
              <div>
                <span className="font-semibold">IP Address:</span>
                <br />
                <span className="whitespace-pre-wrap break-words">
                  {user.ip_address}
                </span>
              </div>
              <div>
                <span className="font-semibold">MAC Address:</span>
                <br />
                <span className="whitespace-pre-wrap break-words">
                  {user.mac_address}
                </span>
              </div>
            </div>
            <Badge variant={user.status_user === 'Aktif' ? 'default' : 'secondary'}>
              {user.status_user}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      size: 80,
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
            <DropdownMenuItem
              onClick={async () => {
                const { data: referenceData } = await supabase
                  .from("users")
                  .select("*")
                  .eq("user_estim", row.original.user_estim)
                  .not("nama", "is", null)
                  .limit(1)
                  .single();

                if (referenceData) {
                  const { error } = await supabase
                    .from("users")
                    .update({
                      nama: referenceData.nama,
                      nip: referenceData.nip,
                      jabatan: referenceData.jabatan,
                      unit_kerja: referenceData.unit_kerja,
                      cab: referenceData.cab,
                      status_user: referenceData.status_user
                    })
                    .eq("id", row.original.id);

                  if (!error) {
                    fetchUsers();
                    alert("Data berhasil diupdate");
                  }
                }
              }}
            >
              Update from Reference
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
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(users.length / pageSize),
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
        <Button 
          variant="secondary" 
          size="default" 
          onClick={updateEmptyUsers}
          className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          Update Empty Data
        </Button>
        <Button variant="outline" size="default" onClick={exportToExcel}>
          Export Excel
        </Button>
        <Button variant="outline" size="default" onClick={printTable}>
          Print
        </Button>
        <Button
          variant="default"
          size="default"
          onClick={() => setIsDialogOpen(true)}
        >
          Add New User
        </Button>
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
            <Table className="border-collapse table-fixed w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead 
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="overflow-hidden"
                      >
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="overflow-hidden"
                        >
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
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Rows per page:
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex w-[100px] items-center justify-center text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"First Page"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {"Last Page"}
          </Button>
        </div>
      </div>
    </div>
  );
}
