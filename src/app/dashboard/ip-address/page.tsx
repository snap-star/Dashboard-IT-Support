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
import { Card, CardContent, CardHeader, CardFooter} from "@/components/ui/card"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

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
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    {}
  );
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

  async function fetchUsers() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
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
    fetchUsers();
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
  }

  async function handleDeleteUser(id: number) {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) {
      console.error("Error deleting user:", error);
      return;
    }
    fetchUsers();
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
    { accessorKey: "user_estim", header: "User ESTIM" },
    { accessorKey: "ip_address", header: "IP Address" },
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
          <Button className="hover:bg-green-700" variant={"outline"} size={"default"} onClick={exportToExcel}>Export Excel</Button>
          <Button variant={"outline"} size={"default"} onClick={printTable}>Print</Button>
          <Button variant={"default"} size={"default"} onClick={() => setIsDialogOpen(true)}>Add New User</Button>
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
            {Object.keys(newUser).map((key) => (
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
            ))}
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
              <h2 className="text-lg font-bold">Daftar User ESTIM & IP Address</h2>
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
        <CardFooter className="font-bold italic text-xs">
          Last updated pada {new Date().toLocaleString()}
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
