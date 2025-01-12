"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import ReportLayout from "@/app/dashboard/reports/layout";
import { Badge } from "@/components/ui/badge";
import supabase from "@/lib/supabase";


type ATMComplaint = {
  id: number;
  atm_id: string;
  complaint: string;
  reported_by: string;
  account_number: string;
  nominal: number;
  date_complaint: string;
  date_reported: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  resolution?: string;
};

function formatToRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBadgeColor(status: string) {
  switch (status) {
    case "Open":
      return "bg-blue-500 text-white"; //warna biru untuk status Open
    case "In Progress":
      return "bg-yellow-500 text-white"; //warna kuning untuk status in progress
    case "Resolved":
      return "bg-green-500 text-white"; //warna hijau untuk status resolved
    case "Closed":
      return "bg-gray-500 text-white"; //warna abu-abu untuk status closed
    default:
      return "bg-gray-500 text-white"; //warna default
  }
}

export default function ATMComplaints() {
  const [complaints, setComplaints] = useState<ATMComplaint[]>([]);
  const [newComplaint, setNewComplaint] = useState<Omit<ATMComplaint, "id">>({
    atm_id: "",
    complaint: "",
    reported_by: "",
    account_number: "",
    nominal: 0,
    date_complaint: new Date().toISOString().split("T")[0],
    date_reported: new Date().toISOString().split("T")[0],
    status: "Open",
    resolution: "",
  });
  const [editingComplaint, setEditingComplaint] = useState<ATMComplaint | null>(
    null
  );
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

    if (error) console.error("Error creating complaint:", error.message, error.details);
    else {
      fetchComplaints();
      setNewComplaint({
        atm_id: "",
        complaint: "",
        reported_by: "",
        account_number: "",
        nominal: 0,
        date_complaint: new Date().toISOString().split("T")[0],
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
            <DialogTitle>
              {editingComplaint ? "Edit Complaint" : "Report New Complaint"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="ATM ID"
              value={editingComplaint ? editingComplaint.atm_id : newComplaint.atm_id}
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      atm_id: e.target.value,
                    })
                  : setNewComplaint({ ...newComplaint, atm_id: e.target.value })
              }
            />
            <Textarea
              placeholder="Complaint Details"
              value={
                editingComplaint
                  ? editingComplaint.complaint
                  : newComplaint.complaint
              }
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      complaint: e.target.value,
                    })
                  : setNewComplaint({
                      ...newComplaint,
                      complaint: e.target.value,
                    })
              }
            />
            <Input
              placeholder="Reported By"
              value={
                editingComplaint
                  ? editingComplaint.reported_by
                  : newComplaint.reported_by
              }
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      reported_by: e.target.value,
                    })
                  : setNewComplaint({
                      ...newComplaint,
                      reported_by: e.target.value,
                    })
              }
            />
            <Input
              placeholder="Account Number"
              value={
                editingComplaint
                  ? editingComplaint.account_number
                  : newComplaint.account_number
              }
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      account_number: e.target.value,
                    })
                  : setNewComplaint({
                      ...newComplaint,
                      account_number: e.target.value,
                    })
              }
            />
            <Input
              type="number"
              placeholder="Nominal"
              value={
                editingComplaint ? editingComplaint.nominal : newComplaint.nominal
              }
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      nominal: Number(e.target.value),
                    })
                  : setNewComplaint({
                      ...newComplaint,
                      nominal: Number(e.target.value),
                    })
              }
            />
            <Input
              type="date"
              placeholder="Date Complaint"
              value={
                editingComplaint
                  ? editingComplaint.date_complaint
                  : newComplaint.date_complaint
              }
              onChange={(e) =>
                editingComplaint
                  ? setEditingComplaint({
                      ...editingComplaint,
                      date_complaint: e.target.value,
                    })
                  : setNewComplaint({
                      ...newComplaint,
                      date_complaint: e.target.value,
                    })
              }
            />
            <Select
              value={editingComplaint ? editingComplaint.status : newComplaint.status}
              onValueChange={(value:any) =>
                editingComplaint
                  ? setEditingComplaint({ ...editingComplaint, status: value })
                  : setNewComplaint({ ...newComplaint, status: value })
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
            {editingComplaint && (
              <Textarea
                placeholder="Resolution"
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
      <Card className="w-full">
        <CardHeader className="font-bold text-lg">
          Laporan Komplain Nasabah
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>ATM ID</TableCell>
                <TableCell>Komplain</TableCell>
                <TableCell>Pelapor</TableCell>
                <TableCell>Nomor Rekening</TableCell>
                <TableCell>Nominal</TableCell>
                <TableCell>Tanggal Komplain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Resolution</TableCell>
                <TableCell>Aksi</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                                <TableRow key={complaint.id}>
                                <TableCell>{complaint.atm_id}</TableCell>
                                <TableCell>{complaint.complaint}</TableCell>
                                <TableCell>{complaint.reported_by}</TableCell>
                                <TableCell>{complaint.account_number}</TableCell>
                                <TableCell>{formatToRupiah(complaint.nominal)}</TableCell>
                                <TableCell>{complaint.date_complaint}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={`rounded-md ${getBadgeColor(complaint.status)}`}>
                                  {complaint.status}
                                  </Badge>
                                  </TableCell>
                                <TableCell>{complaint.resolution || '-'}</TableCell>
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
                      </CardContent>
                      <CardFooter className="font-bold text-xs italic">
                        Terakhir update:
                      </CardFooter>
                    </Card>
                  </ReportLayout>
                );
              }
              
