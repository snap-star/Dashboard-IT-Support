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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import supabase from "@/lib/supabase";
import ReportLayout from "@/app/dashboard/reports/layout";
import { Pencil, Trash, Plus } from "lucide-react";
import { id } from "date-fns/locale/id";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { DateRange } from "react-day-picker";
import { DatePickerDefault } from "@/components/ui/date-picker-default";

type Incident = {
  id: number;
  title: string;
  description: string;
  reported_by: string;
  date_reported: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  resolution?: string;
};

export default function ITIncidentManagement() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [newIncident, setNewIncident] = React.useState<Omit<Incident, "id">>({
    title: "",
    description: "",
    reported_by: "",
    date_reported: new Date().toISOString(),
    status: "Open",
    priority: "Medium",
    resolution: "",
  });
  const [editingIncident, setEditingIncident] = React.useState<Incident | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = React.useState(false);

  React.useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    const { data, error } = await supabase
      .from("it_incidents")
      .select("*")
      .order("date_reported", { ascending: false });
    if (error) {
      console.error("Error fetching incidents:", error);
    } else {
      setIncidents(data || []);
    }
  }

  async function handleCreateOrUpdate() {
    if (editingIncident) {
      const { error } = await supabase
        .from("it_incidents")
        .update(editingIncident)
        .eq("id", editingIncident.id);
      if (error) {
        console.error("Error updating incident:", error);
        return;
      }
    } else {
      const { error } = await supabase
        .from("it_incidents")
        .insert([newIncident]);
      if (error) {
        console.error("Error creating incident:", error);
        return;
      }
    }
    fetchIncidents();
    setIsDialogOpen(false);
    setEditingIncident(null);
    setNewIncident({
      title: "",
      description: "",
      reported_by: "",
      date_reported: new Date().toISOString(),
      status: "Open",
      priority: "Medium",
      resolution: "",
    });
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from("it_incidents").delete().eq("id", id);
    if (error) {
      console.error("Error deleting incident:", error);
      return;
    }
    fetchIncidents();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: "title",
      header: "Problem/Error/Kegiatan",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.getValue("description")}
        >
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "reported_by",
      header: "Pelapor",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {(row.getValue("reported_by") as string).charAt(0).toUpperCase()}
            </span>
          </div>
          <span>{row.getValue("reported_by")}</span>
        </div>
      ),
    },
    {
      accessorKey: "date_reported",
      header: "Tanggal Kejadian",
      cell: ({ row }) => (
        <div className="font-medium">
          {format(new Date(row.getValue("date_reported")), "dd MMM yyyy", {
            locale: id,
          })}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
          >
            {priority}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingIncident(row.original);
              setIsDialogOpen(true);
            }}
            className="h-8 px-2 lg:px-3"
          >
            <Pencil className="h-4 w-4" />
            {/* <span className="hidden lg:inline"></span> */}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
            className="h-8 px-2 lg:px-3"
          >
            <Trash className="h-4 w-4" />
            {/* <span className="hidden lg:inline"></span> */}
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: incidents,
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

  const downloadExcel = async (filtered = false) => {
    setIsExporting(true);
    try {
      let dataToExport;

      if (filtered && dateRange?.from && dateRange?.to) {
        const { data, error } = await supabase
          .from("it_incidents")
          .select("*")
          .gte("date_reported", format(dateRange.from, "yyyy-MM-dd"))
          .lte("date_reported", format(dateRange.to, "yyyy-MM-dd"))
          .order("date_reported", { ascending: false });

        if (error) throw error;
        dataToExport = data;
      } else {
        const { data, error } = await supabase
          .from("it_incidents")
          .select("*")
          .order("date_reported", { ascending: false });

        if (error) throw error;
        dataToExport = data;
      }

      // Format data untuk Excel
      const formattedData = dataToExport.map((item) => ({
        Judul: item.title,
        Deskripsi: item.description,
        Pelapor: item.reported_by,
        "Tanggal Kejadian": format(new Date(item.date_reported), "dd MMM yyyy"),
        Status: item.status,
        Prioritas: item.priority,
        Resolusi: item.resolution || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Insiden");

      // Generate filename dengan timestamp
      const fileName = filtered
        ? `insiden_${format(dateRange!.from!, "yyyyMMdd")}_${format(dateRange!.to!, "yyyyMMdd")}.xlsx`
        : `insiden_all_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;

      XLSX.writeFile(wb, fileName);
      toast.success("Data berhasil diexport");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Gagal mengexport data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ReportLayout>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIncident ? "Edit Incident" : "Add New Incident"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Title"
              value={
                editingIncident ? editingIncident.title : newIncident.title
              }
              onChange={(e) =>
                editingIncident
                  ? setEditingIncident({
                      ...editingIncident,
                      title: e.target.value,
                    })
                  : setNewIncident({ ...newIncident, title: e.target.value })
              }
            />
            <Textarea
              placeholder="Description"
              value={
                editingIncident
                  ? editingIncident.description
                  : newIncident.description
              }
              onChange={(e) =>
                editingIncident
                  ? setEditingIncident({
                      ...editingIncident,
                      description: e.target.value,
                    })
                  : setNewIncident({
                      ...newIncident,
                      description: e.target.value,
                    })
              }
            />
            <Input
              placeholder="Reported By"
              value={
                editingIncident
                  ? editingIncident.reported_by
                  : newIncident.reported_by
              }
              onChange={(e) =>
                editingIncident
                  ? setEditingIncident({
                      ...editingIncident,
                      reported_by: e.target.value,
                    })
                  : setNewIncident({
                      ...newIncident,
                      reported_by: e.target.value,
                    })
              }
            />
            <DatePickerDefault
              date={
                editingIncident
                  ? editingIncident.date_reported
                    ? new Date(editingIncident.date_reported)
                    : new Date()
                  : newIncident.date_reported
                    ? new Date(newIncident.date_reported)
                    : new Date()
              }
              setDateAction={(newDate: Date | undefined) => {
                const selectedDate = newDate || new Date();
                if (editingIncident) {
                  setEditingIncident({
                    ...editingIncident,
                    date_reported: selectedDate.toISOString().split("T")[0],
                  });
                } else {
                  setNewIncident({
                    ...newIncident,
                    date_reported: selectedDate.toISOString().split("T")[0],
                  });
                }
              }}
            />
            <Select
              value={
                editingIncident ? editingIncident.status : newIncident.status
              }
              onValueChange={(value: any) =>
                editingIncident
                  ? setEditingIncident({ ...editingIncident, status: value })
                  : setNewIncident({ ...newIncident, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={
                editingIncident
                  ? editingIncident.priority
                  : newIncident.priority
              }
              onValueChange={(value: any) =>
                editingIncident
                  ? setEditingIncident({ ...editingIncident, priority: value })
                  : setNewIncident({ ...newIncident, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {editingIncident && (
              <Textarea
                placeholder="Resolution (optional)"
                value={editingIncident.resolution || ""}
                onChange={(e) =>
                  setEditingIncident({
                    ...editingIncident,
                    resolution: e.target.value,
                  })
                }
              />
            )}
          </div>
          <Button onClick={handleCreateOrUpdate}>
            {editingIncident ? "Update Incident" : "Create Incident"}
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="w-full overflow-hidden mx-auto max-w-[100vw] h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">List Insiden</CardTitle>
          <CardDescription>
            Daftar semua insiden yang telah dilaporkan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <Input
                placeholder="Cari insiden..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
              />

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd MMM yyyy")} -{" "}
                            {format(dateRange.to, "dd MMM yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "dd MMM yyyy")
                        )
                      ) : (
                        <span>Pilih tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  onClick={() => downloadExcel(true)}
                  disabled={isExporting || !dateRange?.from || !dateRange?.to}
                >
                  {isExporting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export Range
                </Button>

                <Button
                  variant="outline"
                  onClick={() => downloadExcel(false)}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export All
                </Button>

                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Insiden
                </Button>
              </div>
            </div>

            <div className="flex rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="font-semibold">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        Tidak ada data insiden
                      </TableCell>
                    </TableRow>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total {table.getFilteredRowModel().rows.length} insiden
              </span>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ReportLayout>
  );
}
