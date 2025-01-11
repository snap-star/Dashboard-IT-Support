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
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

type AccessLog = {
  id: number;
  user_estim: string;
  ip_address: string;
  nama: string;
  akses_count: number;
  last_access: string;
};

export default function WeekendBankingTable() {
  const [accessLogs, setAccessLogs] = React.useState<AccessLog[]>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newLog, setNewLog] = React.useState<Omit<AccessLog, "id" | "akses_count" | "last_access">>({
    user_estim: "",
    ip_address: "",
    nama: "",
  });

  React.useEffect(() => {
    fetchAccessLogs();
  }, []);

  async function fetchAccessLogs() {
    const { data, error } = await supabase
      .from("access_logs")
      .select("*")
      .order("akses_count", { ascending: false }); // Sort by akses_count descending
    if (error) {
      console.error("Error fetching access logs:", error);
    } else {
      setAccessLogs(data || []);
    }
  }

  async function handleAddLog() {
    const { error } = await supabase
      .from("access_logs")
      .insert({
        ...newLog,
        akses_count: 0,
        last_access: new Date().toISOString(),
      });
    if (error) {
      console.error("Error adding log:", error);
      return;
    }
    fetchAccessLogs();
    setIsDialogOpen(false);
    setNewLog({ user_estim: "", ip_address: "", nama: "" });
  }

  const columns: ColumnDef<AccessLog>[] = [
    { accessorKey: "user_estim", header: "User ESTIM" },
    { accessorKey: "ip_address", header: "IP Address" },
    { accessorKey: "nama", header: "Nama Pemegang" },
    {
      accessorKey: "akses_count",
      header: () => (
        <Button
          variant="ghost"
          onClick={() => console.log("Sort by akses_count")}
        >
          Jumlah Akses <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => <span>{row.original.akses_count}</span>,
    },
    {
      accessorKey: "last_access",
      header: "Akses Terakhir",
      cell: ({ row }) => (
        <span>
          {new Date(row.original.last_access).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      ),
    },
  ];

  const table = useReactTable({
    data: accessLogs,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter logs..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <DialogTrigger asChild> */}
            <Button onClick={() => setIsDialogOpen(true)}>Add New Data</Button>
          {/* </DialogTrigger> */}
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Access Log</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="User ESTIM"
              value={newLog.user_estim}
              onChange={(e) => setNewLog({ ...newLog, user_estim: e.target.value })}
            />
            <Input
              placeholder="IP Address"
              value={newLog.ip_address}
              onChange={(e) => setNewLog({ ...newLog, ip_address: e.target.value })}
            />
            <Input
              placeholder="Nama"
              value={newLog.nama}
              onChange={(e) => setNewLog({ ...newLog, nama: e.target.value })}
            />
          </div>
          <Button onClick={handleAddLog}>Add Data</Button>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Card>
          <CardHeader className="font-bold text-lg">
            Weekend Banking dan Perpanjangan Akses
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
