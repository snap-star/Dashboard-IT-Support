'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import supabase from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationLink,
} from './ui/pagination'
import {
  Search,
  Download,
  MoreVertical,
  Plus,
  Loader2,
  Pencil,
  Upload,
  DownloadIcon,
  Trash,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from 'lucide-react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { Card, CardContent } from './ui/card'
import { useDebounce } from '@/hooks/use-debounce'

// Define types
type As400User = {
  id: number
  username: string
  display_user: string
  ip_address: string
  mac_address: string
  last_login: string
}

type Pegawai = {
  id: number
  nip: string
  name: string
  jabatan: string
  department: string
  as400_users: As400User[]
}

type ExcelPegawai = {
  nip: string
  name: string
  jabatan: string
  department: string
  username: string
  display_user: string
  ip_address: string
  mac_address: string
}

// Tambahkan type untuk sorting
type SortConfig = {
  key: keyof Pegawai | 'username' | 'display_user' | 'ip_address' | 'mac_address'
  direction: 'asc' | 'desc'
}

const EmployeeAS400Management = () => {
  const [pegawai, setPegawai] = useState<Pegawai[]>([])
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | undefined>(undefined)
  const [duplicatePegawai, setDuplicatePegawai] = useState<Pegawai[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newPegawai, setNewPegawai] = useState({
    nip: '',
    name: '',
    department: '',
    jabatan: '',
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddAS400DialogOpen, setIsAddAS400DialogOpen] = useState(false)
  const [newAS400User, setNewAS400User] = useState({
    username: '',
    display_user: '',
    ip_address: '',
    mac_address: '',
  })
  //pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage

  // Tambahkan type untuk sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'id',
    direction: 'asc',
  })

  // Gunakan debounce untuk searchTerm
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Modifikasi useEffect untuk menggunakan debouncedSearchTerm
  useEffect(() => {
    //reset ke halaman pertama ketika search
    setCurrentPage(1)
    fetchPegawai()
  }, [debouncedSearchTerm]) // Ganti searchTerm dengan debouncedSearchTerm

  // Fungsi untuk sorting
  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(currentSort => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Fungsi untuk mendapatkan sorted data
  const getSortedData = (data: Pegawai[]) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === 'username') {
        const aValue = a.as400_users[0]?.username || ''
        const bValue = b.as400_users[0]?.username || ''
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (sortConfig.key === 'display_user') {
        const aValue = a.as400_users[0]?.display_user || ''
        const bValue = b.as400_users[0]?.display_user || ''
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (sortConfig.key === 'ip_address') {
        const aValue = a.as400_users[0]?.ip_address || ''
        const bValue = b.as400_users[0]?.ip_address || ''
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      if (sortConfig.key === 'mac_address') {
        const aValue = a.as400_users[0]?.mac_address || ''
        const bValue = b.as400_users[0]?.mac_address || ''
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      const aValue = String(a[sortConfig.key])
      const bValue = String(b[sortConfig.key])

      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    })
  }

  // Modifikasi currentItems untuk menggunakan sorted data
  const sortedData = getSortedData(pegawai)
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem)

  //editUserESTIM
  const [isEditAS400DialogOpen, setIsEditAS400DialogOpen] = useState(false)
  const [selectedAS400User, setSelectedAS400User] = useState<As400User | undefined>(undefined)

  //upload EXCEL
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  //exceldownloadtemplate
  const downloadTemplate = () => {
    const template = [
      {
        nip: 'NIP 8 Digit',
        name: 'Nama Lengkap',
        jabatan: 'Jabatan Pegawai',
        department: 'Unit Bagian',
        username: 'User ESTIM',
        display_user: 'Display User',
        ip_address: '192.168.1.1',
        mac_address: '00:00:00:00:00:00',
      },
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'user_template.xlsx')
  }

  //Handlers dan Fetch Area

  //Handler Upload Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const data = await readExcelFile(file)
      await uploadBulkData(data)
      setIsUploadDialogOpen(false)
      await fetchPegawai() // Refresh the data
      toast.success('Data berhasil di upload')
    } catch (error) {
      console.error('Error uploading data:', error)
      toast.error('Failed upload data')
    } finally {
      setIsUploading(false)
    }
  }
  const readExcelFile = (file: File): Promise<ExcelPegawai[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async e => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as ExcelPegawai[]
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = error => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  const uploadBulkData = async (data: ExcelPegawai[]) => {
    for (const row of data) {
      try {
        // First, create or find the employee
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .upsert([
            {
              nip: row.nip,
              name: row.name,
              jabatan: row.jabatan,
              department: row.department,
            },
          ])
          .select()
          .single()

        if (employeeError) throw employeeError

        // Then, create the AS400 user for this employee
        if (row.username && row.ip_address) {
          const { error: as400Error } = await supabase.from('as400_users').upsert([
            {
              employee_id: employeeData.id,
              username: row.username,
              display_user: row.display_user,
              ip_address: row.ip_address,
              mac_address: row.mac_address,
            },
          ])

          if (as400Error) throw as400Error
        }
      } catch (error) {
        console.error(`Gagal memproses tabel ${row.name}:`, error)
        throw error
      }
    }
  }

  //new component dialog untuk upload excel
  const UploadDialog = () => (
    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Data Pegawai</DialogTitle>
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
                    {isUploading ? 'Uploading...' : 'Pilih File Excel'}
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
              <DownloadIcon className="h-4 w-4 p-0" />
              Download Template
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            <p>File format should have the following columns:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>nip</li>
              <li>name</li>
              <li>jabatan</li>
              <li>department</li>
              <li>username</li>
              <li>display_user</li>
              <li>ip_address</li>
              <li>mac_address</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Fetch data pegawai dan user ESTIM
  // Perbaikan di fetchPegawai
  const fetchPegawai = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('employees')
        .select(
          `
          *,
          as400_users (
            id,
            username,
            display_user,
            ip_address,
            mac_address
          )
        `,
        )
        .ilike('name', `%${debouncedSearchTerm}%`)

      if (error) throw error
      setPegawai(data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  // Export ke Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const exportData = pegawai.map(emp => ({
        ID: emp.id,
        Nip: emp.nip,
        Name: emp.name,
        Jabatan: emp.jabatan,
        Department: emp.department,
        'User ESTIM': emp.as400_users.map(u => u.username).join(', '),
        'Display User': emp.as400_users.map(u => u.display_user).join(', '),
        'IP Address': emp.as400_users.map(u => u.ip_address).join(', '),
      }))

      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'User ESTIM')
      XLSX.writeFile(wb, 'Data User ESTIM Pegawai.xlsx')
      toast.success('Exported to Excel successfully')
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('Failed to export to Excel')
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewPegawai(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleAddPegawai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.from('employees').insert([newPegawai]).select()

      if (error) throw error

      if (data) {
        setPegawai(prev => [...prev, data[0]])
        setIsAddDialogOpen(false)
        setNewPegawai({
          nip: '',
          name: '',
          jabatan: '',
          department: '',
        })
        toast.success('Berhasil menambahkan data pegawai baru')
      }
    } catch (error) {
      console.error('Error menambahkan pegawai:', error)
      toast.error('Failed menambahkan data pegawai')
    }
  }

  //handleEditPegawai
  const handleEditPegawai = async (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai)
    setNewPegawai({
      nip: pegawai.nip,
      name: pegawai.name,
      jabatan: pegawai.jabatan,
      department: pegawai.department,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePegawai = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPegawai) return

    try {
      const { data, error } = await supabase
        .from('employees')
        .update(newPegawai)
        .eq('id', selectedPegawai.id)
        .select()
      if (error) {
        throw error
      }

      setPegawai(prev => prev.map(p => (p.id === selectedPegawai.id ? { ...p, ...newPegawai } : p)))
      setIsEditDialogOpen(false)
      toast.success('Data Pegawai berhasil di update')
    } catch (error) {
      console.error('Error updating pegawai:', error)
      toast.error('Failed update pegawai')
    }
  }

  //handleDeletePegawai
  const handleDeletePegawai = async (pegawai: Pegawai) => {
    if (confirm('Apakah anda yakin akan menghapus data pegawai?')) {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', pegawai.id)
        if (error) throw error

        setPegawai(prev => prev.filter(p => p.id !== pegawai.id))
        toast.success('Field Pegawai berhasil di hapus')
      } catch (error) {
        console.error('Error menghapus pegawai:', error)
        toast.error('Gagal Menghapus field pegawai')
      }
    }
  }
  //handlerEditUserEstim
  const handleEditAS400User = (user: As400User) => {
    setSelectedAS400User(user)
    setNewAS400User({
      username: user.username,
      display_user: user.display_user,
      ip_address: user.ip_address,
      mac_address: user.mac_address,
    })
    setIsEditAS400DialogOpen(true)
  }
  //handlerUpdateUserESTIm
  const handleUpdateAS400User = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedAS400User) return

    try {
      const { data, error } = await supabase
        .from('as400_users')
        .update({
          username: newAS400User.username,
          display_user: newAS400User.display_user,
          ip_address: newAS400User.ip_address,
          mac_address: newAS400User.mac_address,
        })
        .eq('id', selectedAS400User.id)
        .select()

      if (error) throw error
      // Update local state
      setPegawai(prev =>
        prev.map(p => ({
          ...p,
          as400_users: p.as400_users.map(u =>
            u.id === selectedAS400User.id ? { ...u, ...newAS400User } : u,
          ),
        })),
      )
      setIsEditAS400DialogOpen(false)
      setSelectedAS400User(undefined)
      setNewAS400User({ username: '', display_user: '', ip_address: '', mac_address: '' })
      toast.success('User ESTIM berhasil di update')
    } catch (error) {
      console.error('Error updating user ESTIM:', error)
      toast.error('Gagal mengubah user ESTIM')
    }
  }
  //handleDeleteUserEstim
  const handleDeleteAS400User = async (user: As400User) => {
    if (confirm('Apakah anda yakin akan menghapus user ESTIM?')) {
      try {
        const { error } = await supabase.from('as400_users').delete().eq('id', user.id)
        if (error) throw error

        setPegawai(prev =>
          prev.map(p => ({
            ...p,
            as400_users: p.as400_users.filter(u => u.id !== user.id),
          })),
        )
        toast.success('User Estim Berhasil Di Hapus')
      } catch (error) {
        console.error('error gagal menghapus user:', error)
        toast.error('Gagal Menghapus User Estim')
      }
    }
  }
  //handlerAddUserEstim
  const handleAddAS400User = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai)
    setIsAddAS400DialogOpen(true)
  }
  const handleSubmitAS400User = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPegawai) return

    try {
      const { data, error } = await supabase
        .from('as400_users')
        .insert([
          {
            ...newAS400User,
            employee_id: selectedPegawai.id,
          },
        ])
        .select()
      if (error) throw error

      // Update local state
      setPegawai(prev =>
        prev.map(p => {
          if (p.id === selectedPegawai.id) {
            return {
              ...p,
              as400_users: [...(p.as400_users || []), data[0]],
            }
          }
          return p
        }),
      )
      setIsAddAS400DialogOpen(false)
      setNewAS400User({ username: '', display_user: '', ip_address: '', mac_address: '' })
      toast.success('AS400 user added successfully')
    } catch (error) {
      console.error('Error Menambahkan user ESTIM:', error)
      toast.error('Gagal Menambahkan user ESTIM')
    }
  }

  // Modifikasi fungsi filterDuplicatePegawai
  const filterDuplicatePegawai = () => {
    // Mencari NIP yang duplikat
    const nipCounts = pegawai.reduce(
      (acc, curr) => {
        acc[curr.nip] = (acc[curr.nip] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Filter pegawai yang memiliki NIP duplikat
    const duplicates = pegawai.filter(p => nipCounts[p.nip] > 1)

    if (duplicates.length > 0) {
      setPegawai(duplicates) // Update tabel dengan data duplikat
      toast.success(`Ditemukan ${duplicates.length} data duplikat`)
    } else {
      toast.info('Tidak ditemukan data duplikat')
      fetchPegawai() // Kembalikan ke data semula jika tidak ada duplikat
    }
  }

  // Tambahkan tombol untuk mereset filter
  const resetFilter = async () => {
    await fetchPegawai()
    toast.success('Data berhasil direset')
  }

  // Generate page numbers
  const pageNumbers = []
  for (let i = 1; i <= Math.ceil(pegawai.length / itemsPerPage); i++) {
    pageNumbers.push(i)
  }

  // Handle page changes
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  // Get visible page numbers with ellipsis
  const getVisiblePageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= Math.ceil(pegawai.length / itemsPerPage); i++) {
      if (
        i === 1 ||
        i === Math.ceil(pegawai.length / itemsPerPage) ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  // Tambahkan loading skeleton
  const TableSkeleton = () => (
    <TableRow>
      <TableCell colSpan={10}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-[10%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[20%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )

  // Komponen SortHeader
  const SortHeader = ({ column, label }: { column: SortConfig['key']; label: string }) => (
    <TableHead className="cursor-pointer hover:bg-muted/60" onClick={() => handleSort(column)}>
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${
              sortConfig.key === column && sortConfig.direction === 'asc'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 ${
              sortConfig.key === column && sortConfig.direction === 'desc'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </span>
      </div>
    </TableHead>
  )

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Daftar Pemegang User ESTIM</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari Nama Pegawai..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={filterDuplicatePegawai}>
                  <Filter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter Data Duplikat</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={resetFilter}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Filter</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>

          <Button variant="outline" onClick={exportToExcel}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah
          </Button>
        </div>
      </div>

      <div className="border rounded-lg shadow-xl dark:border-white dark:shadow-white dark:shadow-sm">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <SortHeader column="id" label="ID" />
                    <SortHeader column="nip" label="NIP" />
                    <SortHeader column="name" label="Nama Lengkap" />
                    <SortHeader column="jabatan" label="Jabatan" />
                    <SortHeader column="department" label="Unit Bagian" />
                    <SortHeader column="username" label="User ESTIM" />
                    <SortHeader column="display_user" label="Display User" />
                    <SortHeader column="ip_address" label="IP Address" />
                    <SortHeader column="mac_address" label="MAC Address" />
                    <TableHead className="w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Search className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">Tidak ada data ditemukan</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map(pegawai => (
                      <TableRow key={pegawai.id}>
                        <TableCell>{pegawai.id}</TableCell>
                        <TableCell>{pegawai.nip}</TableCell>
                        <TableCell className="capitalize">{pegawai.name}</TableCell>
                        <TableCell className="capitalize">{pegawai.jabatan}</TableCell>
                        <TableCell className="capitalize">{pegawai.department}</TableCell>
                        <TableCell className="uppercase">
                          <div className="flex flex-col gap-1">
                            {(pegawai.as400_users || []).map(user => (
                              <div key={user.id} className="flex items-center justify-between">
                                <span key={user.id} className="text-sm">
                                  {user.username}
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={'ghost'}
                                        size={'sm'}
                                        onClick={() => handleEditAS400User(user)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="capitalize">
                                      <p>Edit User</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant={'ghost'}
                                        size={'sm'}
                                        onClick={() => handleDeleteAS400User(user)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="capitalize">
                                      <p>Delete User</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="uppercase">
                          <div className="flex flex-col gap-1">
                            {(pegawai.as400_users || []).map(user => (
                              <span key={user.id} className="text-sm">
                                {user.display_user}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(pegawai.as400_users || []).map(user => (
                              <span key={user.id} className="text-sm">
                                {user.ip_address}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(pegawai.as400_users || []).map(user => (
                              <span key={user.id} className="text-sm">
                                {user.mac_address}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="print:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditPegawai(pegawai)}>
                                <Pencil className="h-4 w-4" />
                                Edit Pegawai
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAddAS400User(pegawai)}>
                                <Plus className="h-4 w-4" />
                                Tambah User ESTIM
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeletePegawai(pegawai)}>
                                <Trash className="h-4 w-4" />
                                Delete Pegawai
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Pegawai</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdatePegawai} className="space-y-4">
                                  <div>
                                    <label htmlFor="nip" className="block text-sm font-medium">
                                      NIP
                                    </label>
                                    <Input
                                      type="text"
                                      name="nip"
                                      id="nip"
                                      value={newPegawai.nip}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="name" className="block text-sm font-medium">
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
                                    <label htmlFor="jabatan" className="block text-sm font-medium">
                                      Jabatan
                                    </label>
                                    <Input
                                      type="text"
                                      name="jabatan"
                                      id="jabatan"
                                      value={newPegawai.jabatan}
                                      onChange={handleInputChange}
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
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    Update Data Pegawai
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>

                            <Dialog
                              open={isAddAS400DialogOpen}
                              onOpenChange={setIsAddAS400DialogOpen}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Tambah User ESTIM</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmitAS400User} className="space-y-4">
                                  <div>
                                    <label
                                      htmlFor="username"
                                      className="block text-sm font-medium uppercase"
                                    >
                                      Username
                                    </label>
                                    <Input
                                      className="uppercase"
                                      type="text"
                                      name="username"
                                      id="username"
                                      value={newAS400User.username ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          username: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="display_user"
                                      className="block text-sm font-medium"
                                    >
                                      Display User
                                    </label>
                                    <Input
                                      className="uppercase"
                                      type="text"
                                      name="display_user"
                                      id="display_user"
                                      value={newAS400User.display_user ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          display_user: e.target.value,
                                        }))
                                      }
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
                                      value={newAS400User.ip_address ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          ip_address: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="mac_address"
                                      className="block text-sm font-medium"
                                    >
                                      MAC Address
                                    </label>
                                    <Input
                                      type="text"
                                      name="mac_address"
                                      id="mac_address"
                                      value={newAS400User.mac_address ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          mac_address: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    Tambah Data User
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Dialog
                              open={isEditAS400DialogOpen}
                              onOpenChange={setIsEditAS400DialogOpen}
                            >
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit User & IP Address</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpdateAS400User} className="space-y-4">
                                  <div>
                                    <label htmlFor="username" className="block text-sm font-medium">
                                      Username
                                    </label>
                                    <Input
                                      className="uppercase"
                                      type="text"
                                      name="username"
                                      id="username"
                                      value={newAS400User.username ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          username: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="display_user"
                                      className="block text-sm font-medium"
                                    >
                                      Display User
                                    </label>
                                    <Input
                                      className="uppercase"
                                      type="text"
                                      name="display_user"
                                      id="display_user"
                                      value={newAS400User.display_user ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          display_user: e.target.value,
                                        }))
                                      }
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
                                      value={newAS400User.ip_address ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          ip_address: e.target.value,
                                        }))
                                      }
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="mac_address"
                                      className="block text-sm font-medium"
                                    >
                                      MAC Address
                                    </label>
                                    <Input
                                      type="text"
                                      name="mac_address"
                                      id="mac_address"
                                      value={newAS400User.mac_address ?? ''}
                                      onChange={e =>
                                        setNewAS400User(prev => ({
                                          ...prev,
                                          mac_address: e.target.value,
                                        }))
                                      }
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
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end mt-4 print:hidden">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {getVisiblePageNumbers().map((number, index) => (
              <PaginationItem key={index}>
                {number === '...' ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <PaginationLink
                    onClick={() => handlePageChange(number as number)}
                    className={
                      currentPage === number
                        ? 'bg-primary text-primary-foreground'
                        : 'cursor-pointer'
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
                  currentPage < Math.ceil(pegawai.length / itemsPerPage) &&
                  handlePageChange(currentPage + 1)
                }
                className={
                  currentPage === Math.ceil(pegawai.length / itemsPerPage)
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <UploadDialog />
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pegawai Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPegawai} className="space-y-4">
            <div>
              <label htmlFor="nip" className="block text-sm font-medium">
                NIP
              </label>
              <Input
                type="text"
                name="nip"
                id="nip"
                value={newPegawai.nip}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
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
              <label htmlFor="jabatan" className="block text-sm font-medium">
                Jabatan
              </label>
              <Input
                type="text"
                name="jabatan"
                id="jabatan"
                value={newPegawai.jabatan}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium">
                Unit Bagian
              </label>
              <Input
                type="text"
                name="department"
                id="department"
                value={newPegawai.department}
                onChange={handleInputChange}
              />
            </div>
            <Button type="submit" className="w-full">
              Tambah Pegawai
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeAS400Management
