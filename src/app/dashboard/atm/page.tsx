'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Search, Download, Pencil, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'
import * as XLSX from 'xlsx'
import { DatePickerDefault } from '@/components/ui/date-picker-default'

// Types
interface ATMComplaint {
  id: number
  atm_id: string
  complaint: string
  reported_by: string
  account_number: string
  nominal: number
  date_complaint: string
  date_reported: string
  status: string
  resolution: string
}

// Utility functions
const formatToRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(amount)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'Resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'Closed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }
}

// Tambahkan konstanta untuk page size
const PAGE_SIZE = 10

export default function ATMComplaints() {
  // States
  const [complaints, setComplaints] = useState<ATMComplaint[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [newComplaint, setNewComplaint] = useState<Omit<ATMComplaint, 'id'>>({
    atm_id: '',
    complaint: '',
    reported_by: '',
    account_number: '',
    nominal: 0,
    date_complaint: new Date().toISOString().split('T')[0],
    date_reported: new Date().toISOString().split('T')[0],
    status: 'Open',
    resolution: '',
  })
  const [editingComplaint, setEditingComplaint] = useState<ATMComplaint | null>(null)
  // Tambahkan state untuk pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Effects
  useEffect(() => {
    fetchComplaints()
  }, [])

  // Functions
  async function fetchComplaints() {
    setIsLoading(true)
    try {
      // Fetch total count
      const { count } = await supabase
        .from('atm_complaints')
        .select('*', { count: 'exact', head: true })

      // Fetch paginated data
      const { data, error } = await supabase
        .from('atm_complaints')
        .select('*')
        .order('date_reported', { ascending: false })
        .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)

      if (error) throw error

      setComplaints(data || [])
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE))
    } catch (error) {
      console.error('Error fetching complaints:', error)
      toast.error('Gagal memuat data komplain')
    } finally {
      setIsLoading(false)
    }
  }

  // Effect untuk memuat ulang data saat halaman berubah
  useEffect(() => {
    fetchComplaints()
  }, [currentPage])

  // Fungsi untuk navigasi halaman
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }

  async function handleCreate() {
    const { error } = await supabase.from('atm_complaints').insert([newComplaint])

    if (error) {
      console.error('Error creating complaint:', error)
      toast.error('Gagal menambah komplain')
    } else {
      fetchComplaints()
      setIsDialogOpen(false)
      toast.success('Komplain berhasil ditambahkan')
    }
  }

  async function handleUpdate() {
    if (!editingComplaint) return

    const { error } = await supabase
      .from('atm_complaints')
      .update(editingComplaint)
      .eq('id', editingComplaint.id)

    if (error) {
      console.error('Error updating complaint:', error)
      toast.error('Gagal mengupdate komplain')
    } else {
      fetchComplaints()
      setEditingComplaint(null)
      setIsDialogOpen(false)
      toast.success('Komplain berhasil diupdate')
    }
  }

  const handleDelete = (id: number) => {
    setSelectedId(id)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedId) return

    const { error } = await supabase.from('atm_complaints').delete().eq('id', selectedId)

    if (error) {
      console.error('Error deleting complaint:', error)
      toast.error('Gagal menghapus komplain')
    } else {
      fetchComplaints()
      toast.success('Komplain berhasil dihapus')
    }
    setIsDeleteAlertOpen(false)
    setSelectedId(null)
  }

  const handleExportData = async () => {
    try {
      // Fetch semua data untuk di-export
      const { data, error } = await supabase
        .from('atm_complaints')
        .select('*')
        .order('date_reported', { ascending: false })

      if (error) throw error

      // Format data untuk excel
      const exportData = data.map((item: any) => ({
        'ATM ID': item.atm_id,
        Komplain: item.complaint,
        Pelapor: item.reported_by,
        'No. Rekening': item.account_number,
        Nominal: formatToRupiah(item.nominal),
        'Tanggal Kejadian': format(new Date(item.date_complaint), 'dd MMM yyyy', { locale: id }),
        'Tanggal Lapor': format(new Date(item.date_reported), 'dd MMM yyyy', {
          locale: id,
        }),
        Status: item.status,
        Resolusi: item.resolution || '-',
      }))

      // Buat workbook dan worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Atur lebar kolom
      const colWidths = [
        { wch: 15 }, // ATM ID
        { wch: 40 }, // Komplain
        { wch: 20 }, // Pelapor
        { wch: 20 }, // No. Rekening
        { wch: 15 }, // Nominal
        { wch: 15 }, // Tanggal Kejadian
        { wch: 15 }, // Tanggal Lapor
        { wch: 12 }, // Status
        { wch: 40 }, // Resolusi
      ]
      ws['!cols'] = colWidths

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ATM Complaints')

      // Generate nama file dengan timestamp
      const fileName = `atm_complaints_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`

      // Download file
      XLSX.writeFile(wb, fileName)
      toast.success('Data berhasil di-export')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Gagal mengexport data')
    }
  }

  return (
    <div className="space-y-6 w-full min-h-screen overflow-hidden">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">ATM Complaint Management</CardTitle>
              <CardDescription>Manajemen dan tracking komplain ATM dari nasabah</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportData} className="gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 flex">
                    <Plus className="h-4 w-4" />
                    Tambah Komplain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[500px]">
                  <DialogHeader className="space-y-3 flex">
                    <DialogTitle>
                      {editingComplaint ? 'Edit Komplain' : 'Tambah Komplain Baru'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingComplaint
                        ? 'Edit detail komplain ATM yang sudah ada'
                        : 'Tambahkan komplain ATM baru dari nasabah'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="grid gap-4">
                      {/* Informasi ATM dan Pelapor */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="atm_id">ATM ID</Label>
                          <Input
                            id="atm_id"
                            placeholder="Masukkan ID ATM"
                            value={editingComplaint ? editingComplaint.atm_id : newComplaint.atm_id}
                            onChange={e =>
                              editingComplaint
                                ? setEditingComplaint({
                                    ...editingComplaint,
                                    atm_id: e.target.value,
                                  })
                                : setNewComplaint({
                                    ...newComplaint,
                                    atm_id: e.target.value,
                                  })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="reported_by">Nama Pelapor</Label>
                          <Input
                            id="reported_by"
                            placeholder="Masukkan nama pelapor"
                            value={
                              editingComplaint
                                ? editingComplaint.reported_by
                                : newComplaint.reported_by
                            }
                            onChange={e =>
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
                        </div>
                      </div>

                      {/* Informasi Rekening dan Nominal */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="account_number">Nomor Rekening</Label>
                          <Input
                            id="account_number"
                            placeholder="Masukkan nomor rekening"
                            value={
                              editingComplaint
                                ? editingComplaint.account_number
                                : newComplaint.account_number
                            }
                            onChange={e =>
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
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="nominal">Nominal</Label>
                          <Input
                            id="nominal"
                            type="number"
                            placeholder="Masukkan nominal"
                            value={
                              editingComplaint ? editingComplaint.nominal : newComplaint.nominal
                            }
                            onChange={e =>
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
                        </div>
                      </div>

                      {/* Tanggal dan Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label htmlFor="date_complaint">Tanggal Kejadian</Label>
                          <DatePickerDefault
                            date={
                              editingComplaint
                                ? editingComplaint.date_reported
                                  ? new Date(editingComplaint.date_reported)
                                  : new Date()
                                : newComplaint.date_reported
                                  ? new Date(newComplaint.date_reported)
                                  : new Date()
                            }
                            setDateAction={(newDate: Date | undefined) => {
                              const selectedDate = newDate || new Date()
                              if (editingComplaint) {
                                setEditingComplaint({
                                  ...editingComplaint,
                                  date_reported: selectedDate.toISOString().split('T')[0],
                                })
                              } else {
                                setNewComplaint({
                                  ...newComplaint,
                                  date_reported: selectedDate.toISOString().split('T')[0],
                                })
                              }
                            }}
                          />
                          {/* <Input
                            id="date_complaint"
                            type="date"
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
                          /> */}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={editingComplaint ? editingComplaint.status : newComplaint.status}
                            onValueChange={value =>
                              editingComplaint
                                ? setEditingComplaint({
                                    ...editingComplaint,
                                    status: value,
                                  })
                                : setNewComplaint({
                                    ...newComplaint,
                                    status: value,
                                  })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Open">Open</SelectItem>
                              <SelectItem value="In Progress">In Progress</SelectItem>
                              <SelectItem value="Resolved">Resolved</SelectItem>
                              <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Deskripsi Komplain */}
                      <div className="space-y-1.5">
                        <Label htmlFor="complaint">Deskripsi Komplain</Label>
                        <Textarea
                          id="complaint"
                          placeholder="Masukkan deskripsi komplain"
                          className="min-h-[80px] resize-none"
                          value={
                            editingComplaint ? editingComplaint.complaint : newComplaint.complaint
                          }
                          onChange={e =>
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
                      </div>

                      {/* Resolusi */}
                      <div className="space-y-1.5">
                        <Label htmlFor="resolution">Resolusi</Label>
                        <Textarea
                          id="resolution"
                          placeholder="Masukkan resolusi komplain"
                          className="min-h-[80px] resize-none"
                          value={
                            editingComplaint ? editingComplaint.resolution : newComplaint.resolution
                          }
                          onChange={e =>
                            editingComplaint
                              ? setEditingComplaint({
                                  ...editingComplaint,
                                  resolution: e.target.value,
                                })
                              : setNewComplaint({
                                  ...newComplaint,
                                  resolution: e.target.value,
                                })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false)
                        setEditingComplaint(null)
                      }}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingComplaint) handleUpdate()
                        else handleCreate()
                      }}
                    >
                      {editingComplaint ? 'Simpan Perubahan' : 'Tambah Komplain'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Add Button */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari komplain..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1) // Reset page when searching
                    }}
                    className="flex-1"
                  />
                </div>
                <Select
                  value={statusFilter ?? ''}
                  onValueChange={value => {
                    setStatusFilter(value)
                    setCurrentPage(1) // Reset page when filtering
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ATM ID</TableHead>
                    <TableHead className="font-semibold">Komplain</TableHead>
                    <TableHead className="font-semibold">Pelapor</TableHead>
                    <TableHead className="font-semibold">No. Rekening</TableHead>
                    <TableHead className="font-semibold">Nominal</TableHead>
                    <TableHead className="font-semibold">Tanggal</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Resolusi</TableHead>
                    <TableHead className="font-semibold w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center">
                        <div className="flex items-center justify-center">
                          <svg
                            className="animate-spin h-6 w-6 text-primary"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span className="ml-2">Memuat data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : complaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                        Tidak ada data komplain
                      </TableCell>
                    </TableRow>
                  ) : (
                    complaints.map(complaint => (
                      <TableRow key={complaint.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{complaint.atm_id}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={complaint.complaint}>
                            {complaint.complaint}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {complaint.reported_by.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span>{complaint.reported_by}</span>
                          </div>
                        </TableCell>
                        <TableCell>{complaint.account_number}</TableCell>
                        <TableCell className="font-medium">
                          {formatToRupiah(complaint.nominal)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(complaint.date_complaint), 'dd MMM yyyy', {
                            locale: id,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(complaint.status)}`}
                          >
                            {complaint.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-[200px] truncate"
                            title={complaint.resolution || '-'}
                          >
                            {complaint.resolution || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingComplaint(complaint)
                                setIsDialogOpen(true)
                              }}
                              className="h-8 px-2 lg:px-3"
                            >
                              <Pencil className="h-4 w-4" />
                              {/* <span className="hidden lg:inline">Edit</span> */}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(complaint.id)}
                              className="h-8 px-2 lg:px-3"
                            >
                              <Trash className="h-4 w-4" />
                              {/* <span className="hidden lg:inline">Hapus</span> */}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Total komplain:</span>
              <Badge variant="outline">{totalPages * PAGE_SIZE}</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Halaman</span>
              <span className="font-medium">{currentPage}</span>
              <span>dari</span>
              <span className="font-medium">{totalPages}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus komplain ini?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDelete()} className="bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
