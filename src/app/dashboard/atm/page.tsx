// FILEPATH: e:/work-report/dev/reportapp/src/app/dashboard/atm-complaints/page.tsx
"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ReportLayout from "@/app/dashboard/reports/layout";

const supabase = createClient(
  "https://qqtcdaamobxjtahrorwl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE"
);

type ATMComplaint = {
  id: number;
  atm_id: string;
  complaint: string;
  reported_by: string;
  date_reported: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  resolution?: string;
};

export default function ATMComplaints() {
  const [complaints, setComplaints] = useState<ATMComplaint[]>([]);
  const [newComplaint, setNewComplaint] = useState<Omit<ATMComplaint, "id">>({
    atm_id: "",
    complaint: "",
    reported_by: "",
    date_reported: new Date().toISOString().split("T")[0],
    status: "Open",
    resolution: "",
  });
  const [editingComplaint, setEditingComplaint] = useState<ATMComplaint | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    const { data, error } = await supabase
      .from("atm_complaints")
      .select("*")
      .order("date_reported", { ascending: false });

    if (error) console.error("Error fetching complaints:", error);
    else setComplaints(data || []);
  }

  async function handleCreate() {
    const { data, error } = await supabase.from("atm_complaints").insert([newComplaint]);

    if (error) console.error("Error creating complaint:", error);
    else {
      fetchComplaints();
      setNewComplaint({
        atm_id: "",
        complaint: "",
        reported_by: "",
        date_reported: new Date().toISOString().split("T")[0],
        status: "Open",
        resolution: "",
      });
      setIsDialogOpen(false);
    }
  }

  async function handleUpdate() {
    if (!editingComplaint) return;

    const { error } = await supabase
      .from("atm_complaints")
      .update(editingComplaint)
      .eq("id", editingComplaint.id);

    if (error) console.error("Error updating complaint:", error);
    else {
      fetchComplaints();
      setEditingComplaint(null);
      setIsDialogOpen(false);
    }
  }

  async function handleDelete(id: number) {
    const { error } = await supabase.from("atm_complaints").delete().eq("id", id);

    if (error) console.error("Error deleting complaint:", error);
    else fetchComplaints();
  }

  return (
    <ReportLayout>
      <h1 className="text-2xl font-bold mb-4">ATM Complaint Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Report New Complaint</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingComplaint ? "Edit Complaint" : "Report New Complaint"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="ATM ID"
              value={editingComplaint ? editingComplaint.atm_id : newComplaint.atm_id}
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, atm_id: e.target.value })
                  : setNewComplaint({ ...newComplaint, atm_id: e.target.value })
              }
            />
            <Textarea
              placeholder="Complaint Details"
              value={editingComplaint ? editingComplaint.complaint : newComplaint.complaint}
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, complaint: e.target.value })
                  : setNewComplaint({ ...newComplaint, complaint: e.target.value })
              }
            />
            <Input
              placeholder="Reported By"
              value={editingComplaint ? editingComplaint.reported_by : newComplaint.reported_by}
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, reported_by: e.target.value })
                  : setNewComplaint({ ...newComplaint, reported_by: e.target.value })
              }
            />
            <Input
              type="date"
              value={editingComplaint ? editingComplaint.date_reported : newComplaint.date_reported}
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, date_reported: e.target.value })
                  : setNewComplaint({ ...newComplaint, date_reported: e.target.value })
              }
            />
            <Select
              value={editingComplaint ? editingComplaint.status : newComplaint.status}
              onValueChange={(value: "Open" | "In Progress" | "Resolved" | "Closed") =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, status: value })
                  : setNewComplaint({ ...newComplaint, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            {editingComplaint && (
              <Textarea
                placeholder="Resolution (if applicable)"
                value={editingComplaint.resolution || ""}
                onChange={(e) =>
                  setEditingComplaint({ ...editingComplaint, resolution: e.target.value })
                }
              />
            )}
          </div>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                if (editingComplaint) handleUpdate();
                else handleCreate();
              }}
            >
              {editingComplaint ? "Update Complaint" : "Create Complaint"}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>ATM ID</TableCell>
            <TableCell>Complaint</TableCell>
            <TableCell>Reported By</TableCell>
            <TableCell>Date Reported</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>{complaint.atm_id}</TableCell>
              <TableCell>{complaint.complaint}</TableCell>
              <TableCell>{complaint.reported_by}</TableCell>
              <TableCell>{complaint.date_reported}</TableCell>
              <TableCell>{complaint.status}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingComplaint(complaint);
                      setIsDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(complaint.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportLayout>
  );
}
