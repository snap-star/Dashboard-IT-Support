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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker"; // Assume we have a custom date picker component
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
} from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";
import ReportLayout from "@/app/dashboard/reports/layout";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

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
    null
  );
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

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

  const columns: ColumnDef<Incident>[] = [
    { accessorKey: "title", header: "Problem/Error" },
    { accessorKey: "description", header: "Deskripsi" },
    { accessorKey: "reported_by", header: "Pelapor" },
    { accessorKey: "date_reported", header: "Tanggal Kejadian" },
    { accessorKey: "status", header: "Status" },
    { accessorKey: "priority", header: "Priority" },
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
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
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

  return (
    <ReportLayout>
      <h1 className="text-2xl font-bold mb-4">IT Incident Management</h1>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Filter incidents..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        {/* <DialogTrigger asChild> */}
        <Button onClick={() => setIsDialogOpen(true)}>Add New Incident</Button>
        {/* </DialogTrigger> */}
      </div>
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
            <DatePicker
              value={
                new Date(
                  editingIncident?.date_reported || newIncident.date_reported
                )
              }
              onChange={(date: Date | undefined) => {
                const selectedDate = date || new Date(); // Fallback to current date if `date` is undefined
                if (editingIncident) {
                  setEditingIncident({
                    ...editingIncident,
                    date_reported: selectedDate.toISOString(),
                  });
                } else {
                  setNewIncident({
                    ...newIncident,
                    date_reported: selectedDate.toISOString(),
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
      <div className="rounded-md border">
        <Card className="w-full">
          <CardHeader className="font-bold text-lg">List Insiden</CardHeader>
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
                {table.getRowModel().rows.map((row) => (
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="font-bold italic text-xs">
            Terakhir di update :
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
    </ReportLayout>
  );
}
