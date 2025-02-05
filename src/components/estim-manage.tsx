"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import supabase from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from "./ui/pagination";
import {
  Search,
  Download,
  MoreVertical,
  Plus,
  Loader2,
  Pencil,
  Upload,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

// Define types
type As400User = {
  id: number;
  username: string;
  ip_address: string;
  last_login: string;
};

type Pegawai = {
  id: number;
  name: string;
  department: string;
  as400_users: As400User[];
};

type ExcelPegawai = {
  name: string;
  department: string;
  username: string;
  ip_address: string;
};

const EmployeeAS400Management = () => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPegawai, setNewPegawai] = useState({
    name: "",
    department: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddAS400DialogOpen, setIsAddAS400DialogOpen] = useState(false);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);
  const [newAS400User, setNewAS400User] = useState({
    username: "",
    ip_address: "",
  });
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = pegawai.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pegawai.length / itemsPerPage);

  //editUserESTIM
  const [isEditAS400DialogOpen, setIsEditAS400DialogOpen] = useState(false);
  const [selectedAS400User, setSelectedAS400User] = useState<As400User | null>(
    null,
  );

  //upload EXCEL
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  //exceldownloadtemplate
  const downloadTemplate = () => {
    const template = [
      {
        name: "Example Name",
        department: "Example Department",
        username: "example_user",
        ip_address: "192.168.1.1"
      }
    ];
  
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "user_template.xlsx");
  };

  //Handlers dan Fetch Area

  //Handler Upload Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setIsUploading(true);
    try {
      const data = await readExcelFile(file);
      await uploadBulkData(data);
      setIsUploadDialogOpen(false);
      await fetchPegawai(); // Refresh the data
      toast.success("Data uploaded successfully");
    } catch (error) {
      console.error("Error uploading data:", error);
      toast.error("Failed to upload data");
    } finally {
      setIsUploading(false);
    }
  };
  const readExcelFile = (file: File): Promise<ExcelPegawai[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelPegawai[];
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const uploadBulkData = async (data: ExcelPegawai[]) => {
    for (const row of data) {
      try {
        // First, create or find the employee
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .upsert([
            {
              name: row.name,
              department: row.department
            }
          ])
          .select()
          .single();
  
        if (employeeError) throw employeeError;
  
        // Then, create the AS400 user for this employee
        if (row.username && row.ip_address) {
          const { error: as400Error } = await supabase
            .from('as400_users')
            .upsert([
              {
                employee_id: employeeData.id,
                username: row.username,
                ip_address: row.ip_address
              }
            ]);
  
          if (as400Error) throw as400Error;
        }
      } catch (error) {
        console.error(`Error processing row for ${row.name}:`, error);
        throw error;
      }
    }
  };

  //new component dialog untuk upload excel
  const UploadDialog = () => (
    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Employee Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-4 border-dashed hover:bg-gray-100 hover:border-gray-300">
                <div className="flex flex-col items-center justify-center pt-7">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-gray-600" />
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    {isUploading ? "Uploading..." : "Select Excel file"}
                  </p>
                </div>
                <input
                  type="file"
                  className="opacity-0"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            </div>
            <Button onClick={downloadTemplate} variant="outline" className="mt-2">
  Download Template
</Button>
          </div>
          <div className="text-sm text-gray-500">
            <p>File format should have the following columns:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>name</li>
              <li>department</li>
              <li>username (optional)</li>
              <li>ip_address (optional)</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Fetch data pegawai dan user AS400
  // Perbaikan di fetchPegawai
  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select(
          `
          *,
          as400_users (
            id,
            username,
            ip_address,
            last_login
          )
        `,
        )
        .ilike("name", `%${searchTerm}%`);

      if (error) throw error;
      setPegawai(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPegawai();
  }, [searchTerm]); // Add searchTerm as dependency

  // Export ke Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const exportData = pegawai.map((emp) => ({
        "Employee ID": emp.id,
        Name: emp.name,
        Department: emp.department,
        "AS400 Users": emp.as400_users.map((u) => u.username).join(", "),
        "IP Addresses": emp.as400_users.map((u) => u.ip_address).join(", "),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "User ESTIM");
      XLSX.writeFile(wb, "Data User ESTIM Pegawai.xlsx");
      toast.success("Exported to Excel successfully");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Failed to export to Excel");
    }
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPegawai((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleAddPegawai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([newPegawai])
        .select();

      if (error) throw error;

      if (data) {
        setPegawai((prev) => [...prev, data[0]]);
        setIsAddDialogOpen(false);
        setNewPegawai({
          name: "",
          department: "",
        });
        toast.success("Employee added successfully");
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error("Failed to add employee");
    }
  };

  //handleEditPegawai
  const handleEditPegawai = async (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setNewPegawai({
      name: pegawai.name,
      department: pegawai.department,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePegawai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPegawai) return;

    try {
      const { data, error } = await supabase
        .from("employees")
        .update(newPegawai)
        .eq("id", selectedPegawai.id)
        .select();
      if (error) throw error;

      setPegawai((prev) =>
        prev.map((p) =>
          p.id === selectedPegawai.id ? { ...p, ...newPegawai } : p,
        ),
      );
      setIsEditDialogOpen(false);
      toast.success("Employee updated successfully");
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    }
  };

  //handleDeletePegawai
  const handleDeletePegawai = async (pegawai: Pegawai) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const { error } = await supabase
          .from("employees")
          .delete()
          .eq("id", pegawai.id);
        if (error) throw error;

        setPegawai((prev) => prev.filter((p) => p.id !== pegawai.id));
        toast.success("Employee deleted successfully");
      } catch (error) {
        console.error("Error deleting employee:", error);
        toast.error("Failed to delete employee");
      }
    }
  };
  //handlerEditUserEstim
  const handleEditAS400User = (user: As400User) => {
    setSelectedAS400User(user);
    setNewAS400User({
      username: user.username,
      ip_address: user.ip_address,
    });
    setIsEditAS400DialogOpen(true);
  };
  //handlerUpdateUserESTIm
  const handleUpdateAS400User = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAS400User) return;

    try {
      const { data, error } = await supabase
        .from("as400_users")
        .update({
          username: newAS400User.username,
          ip_address: newAS400User.ip_address,
        })
        .eq("id", selectedAS400User.id)
        .select();

      if (error) throw error;
      // Update local state
      setPegawai((prev) =>
        prev.map((p) => ({
          ...p,
          as400_users: p.as400_users.map((u) =>
            u.id === selectedAS400User.id ? { ...u, ...newAS400User } : u,
          ),
        })),
      );
      setIsEditAS400DialogOpen(false);
      setSelectedAS400User(null);
      setNewAS400User({ username: "", ip_address: "" });
      toast.success("AS400 user updated successfully");
    } catch (error) {
      console.error("Error updating AS400 user:", error);
      toast.error("Failed to update AS400 user");
    }
  };
  //handlerAddUserEstim
  const handleAddAS400User = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setIsAddAS400DialogOpen(true);
  };
  const handleSubmitAS400User = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPegawai) return;

    try {
      const { data, error } = await supabase
        .from("as400_users")
        .insert([
          {
            ...newAS400User,
            employee_id: selectedPegawai.id,
          },
        ])
        .select();
      if (error) throw error;

      // Update local state
      setPegawai((prev) =>
        prev.map((p) => {
          if (p.id === selectedPegawai.id) {
            return {
              ...p,
              as400_users: [...(p.as400_users || []), data[0]],
            };
          }
          return p;
        }),
      );
      setIsAddAS400DialogOpen(false);
      setNewAS400User({ username: "", ip_address: "" });
      toast.success("AS400 user added successfully");
    } catch (error) {
      console.error("Error adding AS400 user:", error);
      toast.error("Failed to add AS400 user");
    }
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Get visible page numbers with ellipsis
  const getVisiblePageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Pemegang User ESTIM</h1>
        <div className="flex gap-4">
          <div className="flex items-center rounded-md px-3 py-2">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <Input
              placeholder="Cari Nama Pegawai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 focus:ring-0"
            />
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Excel
          </Button>
          <Button onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Pegawai
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Daftar Pegawai</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPegawai} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium"
                  >
                    Nama Lengkap
                  </label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={newPegawai.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="department"
                    className="block text-sm font-medium"
                  >
                    Unit Bagian
                  </label>
                  <Input
                    type="text"
                    name="department"
                    id="department"
                    value={newPegawai.department}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Tambah Pegawai
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Unit Bagian</TableHead>
              <TableHead>User ESTIM</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  <div className="flex justify-center items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No data found.
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((pegawai) => (
                <TableRow key={pegawai.id}>
                  <TableCell>{pegawai.id}</TableCell>
                  <TableCell>{pegawai.name}</TableCell>
                  <TableCell>{pegawai.department}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Tambahkan optional chaining */}
                      {(pegawai.as400_users || []).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between"
                        >
                          <span key={user.id} className="text-sm">
                            {user.username}
                          </span>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={() => handleEditAS400User(user)}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(pegawai.as400_users || []).map((user) => (
                        <span key={user.id} className="text-sm">
                          {user.ip_address}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditPegawai(pegawai)}
                        >
                          Edit Pegawai
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAddAS400User(pegawai)}
                        >
                          Tambah User ESTIM
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="bg-red-500"
                          onClick={() => handleDeletePegawai(pegawai)}
                        >
                          Delete Pegawai
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                      {/* Add Edit Dialog */}
                      <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={setIsEditDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Pegawai</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleUpdatePegawai}
                            className="space-y-4"
                          >
                            <div>
                              <label
                                htmlFor="name"
                                className="block text-sm font-medium"
                              >
                                Nama Lengkap
                              </label>
                              <Input
                                type="text"
                                name="name"
                                id="name"
                                value={newPegawai.name}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="department"
                                className="block text-sm font-medium"
                              >
                                Unit Bagian
                              </label>
                              <Input
                                type="text"
                                name="department"
                                id="department"
                                value={newPegawai.department}
                                onChange={handleInputChange}
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Update Data Pegawai
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>

                      {/* Add AS400 User Dialog */}
                      <Dialog
                        open={isAddAS400DialogOpen}
                        onOpenChange={setIsAddAS400DialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tambah User ESTIM</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleSubmitAS400User}
                            className="space-y-4"
                          >
                            <div>
                              <label
                                htmlFor="username"
                                className="block text-sm font-medium"
                              >
                                Username
                              </label>
                              <Input
                                type="text"
                                name="username"
                                id="username"
                                value={newAS400User.username}
                                onChange={(e) =>
                                  setNewAS400User((prev) => ({
                                    ...prev,
                                    username: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="ip_address"
                                className="block text-sm font-medium"
                              >
                                IP Address
                              </label>
                              <Input
                                type="text"
                                name="ip_address"
                                id="ip_address"
                                value={newAS400User.ip_address}
                                onChange={(e) =>
                                  setNewAS400User((prev) => ({
                                    ...prev,
                                    ip_address: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Tambah Data User
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                      {/* Edit User ESTIM Dialog */}
                      <Dialog
                        open={isEditAS400DialogOpen}
                        onOpenChange={setIsEditAS400DialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User & IP Address</DialogTitle>
                          </DialogHeader>
                          <form
                            onSubmit={handleUpdateAS400User}
                            className="space-y-4"
                          >
                            <div>
                              <label
                                htmlFor="username"
                                className="block text-sm font-medium"
                              >
                                Username
                              </label>
                              <Input
                                type="text"
                                name="username"
                                id="username"
                                value={newAS400User.username}
                                onChange={(e) =>
                                  setNewAS400User((prev) => ({
                                    ...prev,
                                    username: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="ip_address"
                                className="block text-sm font-medium"
                              >
                                IP Address
                              </label>
                              <Input
                                type="text"
                                name="ip_address"
                                id="ip_address"
                                value={newAS400User.ip_address}
                                onChange={(e) =>
                                  setNewAS400User((prev) => ({
                                    ...prev,
                                    ip_address: e.target.value,
                                  }))
                                }
                                required
                              />
                            </div>
                            <Button type="submit" className="w-full">
                              Update User & IP
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {getVisiblePageNumbers().map((number, index) => (
              <PaginationItem key={index}>
                {number === "..." ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(number as number)}
                    className={
                      currentPage === number
                        ? "bg-primary text-primary-foreground"
                        : "cursor-pointer"
                    }
                  >
                    {number}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  currentPage < totalPages && handlePageChange(currentPage + 1)
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <UploadDialog />
    </div>
  );
};

export default EmployeeAS400Management;
