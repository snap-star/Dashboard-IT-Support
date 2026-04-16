"use client"

import { useEffect, useState, type FormEvent } from "react"
import supabase from "@/lib/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Employee {
  id?: number
  nip: string
  nama: string
  jabatan: string
  department: string
  created_at?: string | null
}

export default function PegawaiPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    jabatan: "",
    department: "",
  })

  useEffect(() => {
    void fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("employee")
      .select("id, nip, nama, jabatan, department, created_at")
      .order("nip", { ascending: true })

    if (error) {
      console.error("Gagal memuat data pegawai:", error)
    } else if (data) {
      setEmployees(data)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase.from("employee").insert([
      {
        nip: formData.nip,
        nama: formData.nama,
        jabatan: formData.jabatan,
        department: formData.department,
      },
    ])

    if (error) {
      console.error("Gagal menyimpan pegawai:", error)
      return
    }

    setFormData({ nip: "", nama: "", jabatan: "", department: "" })
    setIsOpen(false)
    void fetchEmployees()
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Pegawai</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Tambah Pegawai</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Data Pegawai Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="jabatan">Jabatan</Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                />
              </div>
              <Button type="submit">Simpan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NIP</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Jabatan</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow key={employee.id ?? index}>
                <TableCell>{employee.nip}</TableCell>
                <TableCell>{employee.nama}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.jabatan}</TableCell>
                <TableCell>
                  {employee.created_at
                    ? new Date(employee.created_at).toLocaleDateString("id-ID")
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
